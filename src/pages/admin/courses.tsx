import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X, Trash } from "lucide-react";

import { Field, FieldGroup } from "@/components/ui/field"


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, removeCourse, addCourse, updateCourseInstructors } =
    useEnrollmentStore();

 const [removeCourseCode, setRemoveCourseCode] = useState("");

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [removeCourseDialogOpen, setRemoveCourseDialogOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [instructorSearch, setInstructorSearch] = useState("");

  const anchor = useComboboxAnchor();

  const allExistingInstructors = useMemo(() => {
    const list = courses.flatMap((c) => c.instructors ?? []);
    return Array.from(new Set(list)) as string[];
  }, [courses]);

  const duplicateCourse = useMemo(() => {
    const trimmed = courseCode.trim().toLowerCase();
    if (!trimmed) return null;
    return (
      courses.find(
        (c) => c.courseCode.trim().toLowerCase() === trimmed
      ) ?? null
    );
  }, [courses, courseCode]);

  const isDuplicate = Boolean(duplicateCourse);

  const trimmedSearch = instructorSearch.trim();
  const isCustomInstructor =
    trimmedSearch !== "" &&
    !allExistingInstructors.some(
      (name) => name.toLowerCase() === trimmedSearch.toLowerCase()
    );

  const handleDialogOpenChange = (open: boolean) => {
    setCourseDialogOpen(open);
    if (!open) {
      setCourseCode("");
      setCourseTitle("");
      setSelectedInstructors([]);
      setInstructorSearch("");
    }
  };

  const handleSaveCourse = () => {
    if (!courseCode.trim() || !courseTitle.trim() || isDuplicate) return;

    if (addCourse) {
      addCourse({
        courseCode: courseCode.trim().toUpperCase(),
        courseTitle: courseTitle.trim(),
        instructors: selectedInstructors,
      });
    }

    handleDialogOpenChange(false);
  };

  const handleRemoveInstructorFromCourse = (
    courseCodeTarget: string,
    instructorName: string
  ) => {
    if (updateCourseInstructors) {
      const currentCourse = courses.find((c) => c.courseCode === courseCodeTarget);
      if (currentCourse) {
        const nextInstructors = (currentCourse.instructors ?? []).filter(
          (t: string) => t !== instructorName
        );
        updateCourseInstructors(courseCodeTarget, nextInstructors);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้าจัดการการลงทะเบียนทันที
          </p>
        </div>
        
        <Dialog open={removeCourseDialogOpen}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>ลบวิชา ?</DialogTitle>
                    <DialogDescription>
                    ลบ {courses.find((c) => c.courseCode === removeCourseCode)?.courseTitle} ออกจากรายวิชาที่เปิดสอน ?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={()=>setRemoveCourseDialogOpen(false)}>
                            Cancel
                    </Button>
                    <Button 
                        type="button"
                        variant="destructive" 
                        onClick={()=>
                    {
                        removeCourse(removeCourseCode);
                        setRemoveCourseDialogOpen(false);
                    }                    
                    }>
                        ยืนยัน
                        </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={courseDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มวิชา
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  placeholder="เช่น CS101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  aria-invalid={isDuplicate}
                  className={
                    isDuplicate
                      ? "border-red-500 focus-visible:ring-red-500 text-red-600 dark:text-red-400"
                      : ""
                  }
                />
                {isDuplicate && (
                  <p className="text-xs font-medium text-red-500">
                    มีรหัสวิชา {duplicateCourse?.courseCode.toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  placeholder="เช่น Introduction to Programming"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>ผู้สอน</Label>
                <Combobox
                  multiple
                  value={selectedInstructors}
                  onValueChange={(val) => {
                    setSelectedInstructors(val);
                    setInstructorSearch("");
                  }}
                >
                  <ComboboxChips
                    ref={anchor}
                    >
                    <ComboboxValue>
                      {(values: string[]) => (
                        <>
                          {values.map((value) => (
                            <ComboboxChip key={value}>
                              {value}
                            </ComboboxChip>
                          ))}
                        </>
                      )}
                    </ComboboxValue>
                    <ComboboxChipsInput
                      placeholder={
                        selectedInstructors.length === 0
                          ? "เลือกหรือพิมพ์ชื่อผู้สอน..."
                          : ""
                      }
                      value={instructorSearch}
                      onChange={(e) => setInstructorSearch(e.target.value)}
                    />
                  </ComboboxChips>

                  <ComboboxContent anchor={anchor} className="w-[--radix-combobox-trigger-width]">
                    <ComboboxList>
                        {allExistingInstructors.map((instructor) => (
                        <ComboboxItem key={instructor} value={instructor}>
                            {instructor}
                        </ComboboxItem>
                        ))}

                        {isCustomInstructor && (
                        <ComboboxItem
                            value={instructorSearch}
                            className="font-medium text-primary cursor-pointer"
                            onSelect={() => {
                                setInstructorSearch("");
                                setSelectedInstructors((prev) => [...prev, instructorSearch]);
                            }}
                        >
                            + เพิ่มผู้สอน "{instructorSearch}"
                        </ComboboxItem>
                        )}

                        {allExistingInstructors.length === 0 && !isCustomInstructor && (
                        <ComboboxEmpty>ไม่พบข้อมูลผู้สอน</ComboboxEmpty>
                        )}
                    </ComboboxList>
                    </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                disabled={
                  !courseCode.trim() || !courseTitle.trim() || isDuplicate
                }
                onClick={handleSaveCourse}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่มีข้อมูลวิชาเรียน
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">
                    {course.courseCode}
                  </TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">       
                        {
                        course.instructors?.length === 0 ? 
                        <span className="text-xs text-muted-foreground">ยังไม่มีผู้สอน</span> 
                        : 
                           course.instructors? course.instructors.map((t) => 
                                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border dark:border-blue-300 border-blue-700">
                                        {t}  
                                        <button 
                                        className="-mr-0.5 rounded-full hover:text-destructive text-xs"
                                        onClick={() =>
                                             handleRemoveInstructorFromCourse(
                                                course.courseCode,
                                                t
                                            )
                                        }
                                        >
                                        <X data-icon="inline-end" size={16}/>
                                        </button>
                                    </Badge>
                            ) : 
                        <span className="text-xs text-muted-foreground">ยังไม่มีผู้สอน</span> 
                        }
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                            setRemoveCourseCode(course.courseCode);
                            setRemoveCourseDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}