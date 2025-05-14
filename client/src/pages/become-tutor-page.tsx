import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { tutorApplicationSchema } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

export default function BecomeTutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  // Form definition
  const form = useForm<z.infer<typeof tutorApplicationSchema>>({
    resolver: zodResolver(tutorApplicationSchema),
    defaultValues: {
      department: "",
      yearOfStudy: 1,
      cwa: 3.4,
      subjects: [],
    },
  });

  // Submit handler mutation
  const applicationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof tutorApplicationSchema>) => {
      const formData = new FormData();
      formData.append("application", JSON.stringify(data));
      if (file) {
        formData.append("transcript", file);
      }
      
      await apiRequest("POST", "/api/tutor-applications", formData);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully",
        description: "Your application to become a tutor has been submitted for review.",
      });
      form.reset();
      setFile(null);
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof tutorApplicationSchema>) {
    if (!file) {
      toast({
        title: "Missing transcript",
        description: "Please upload your academic transcript",
        variant: "destructive",
      });
      return;
    }
    
    applicationMutation.mutate(data);
  }

  // Mock departments and subjects for the form
  const mockDepartments = [
    { value: "computer-science", label: "Computer Science" },
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "economics", label: "Economics" },
    { value: "engineering", label: "Engineering" },
    { value: "medicine", label: "Medicine" },
  ];

  const mockSubjects = [
    { id: "programming", label: "Programming" },
    { id: "calculus", label: "Calculus" },
    { id: "mechanics", label: "Mechanics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "economics", label: "Economics" },
    { id: "statistics", label: "Statistics" },
    { id: "algebra", label: "Algebra" },
    { id: "biology", label: "Biology" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="pt-16 flex flex-1">
        <Sidebar />
        
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Become a Tutor</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Share your knowledge and earn by teaching your peers
              </p>
            </div>

            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Tutor Application</CardTitle>
                <CardDescription>
                  Fill out the form below to apply as a tutor. Applications are reviewed by our admin team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockDepartments.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value}>
                                  {dept.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your current department at KNUST
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearOfStudy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Study</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your year of study" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                              <SelectItem value="4">4th Year</SelectItem>
                              <SelectItem value="5">5th Year</SelectItem>
                              <SelectItem value="6">6th Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your current year of study
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cwa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cumulative Weighted Average (CWA)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              min="0" 
                              max="4.0" 
                              placeholder="Enter your CWA" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Your current CWA (minimum 3.4 required)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subjects"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Subjects You Can Teach</FormLabel>
                            <FormDescription>
                              Select the subjects you are proficient in and can teach others
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {mockSubjects.map((subject) => (
                              <FormField
                                key={subject.id}
                                control={form.control}
                                name="subjects"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={subject.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(subject.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, subject.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== subject.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {subject.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Academic Transcript</FormLabel>
                      <div className="mt-2">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="transcript-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF or image file (MAX. 2MB)
                              </p>
                            </div>
                            <input
                              id="transcript-upload"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                        {file && (
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Selected file: {file.name}
                          </p>
                        )}
                      </div>
                      <FormDescription>
                        Upload your academic transcript to verify your CWA
                      </FormDescription>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <Textarea
                        placeholder="Tell us about your teaching experience, your strengths, and why you want to be a tutor"
                        className="resize-none"
                      />
                      <FormDescription>
                        Optional: Any additional information that might help with your application
                      </FormDescription>
                    </FormItem>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={applicationMutation.isPending}
                    >
                      {applicationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Note:</strong> Your application will be reviewed by our administrators. You must have a minimum CWA of 3.4 to be eligible. The verification process typically takes 1-3 business days.
                </p>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
