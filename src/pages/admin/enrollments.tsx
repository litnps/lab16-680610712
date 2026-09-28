import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enroll, drop } = useEnrollmentStore();

  // const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  // for multiple
  const [formStudent, setFormStudent] = useState<string[]>([])
  const anchor = useComboboxAnchor();

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const availableStudentOptions = studentOptions.filter(
    (s) =>
      !students.some((S) => S.studentId === s.value && ((formCourse) ? S.enrolledCourses.includes(formCourse) : 1))
  );

  const handleEnroll = () => {
    if (!formStudent || !formCourse) return;
    formStudent.map( (s) => enroll(s, formCourse));
    setEnrollDialogOpen(false);
    setFormStudent([]);
    setFormCourse(null);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent([]);
      setFormCourse(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น (เลือกได้มากกว่า 1 คน)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">

            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder={
                  "เลือกวิชา"
                }
                onChange={(v) =>{
                  setFormCourse(v);
                  setFormStudent([]);
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              {/* <OptionSelect
                id="formStudent"
                options={availableStudentOptions}
                value={formStudent}
                placeholder={
                  formCourse && availableStudentOptions.length === 0
                    ? "นักศึกษาลงทะเบียนครบแล้ว"
                    : "เลือกนักศึกษาเพื่อลงทะเบียน"
                }
                onChange={(v) => {
                  setFormStudent(v);
                }}
              /> */}

              <Combobox
                multiple
                value={formStudent}
                onValueChange={setFormStudent}
              >
                <ComboboxChips ref={anchor} className="w-full max-w-xs">
                  <ComboboxValue>
                    {formStudent.map((item) => (
                      <ComboboxChip key={item}>{item}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  {formStudent.length === 0 && 
                    <ComboboxChipsInput placeholder={
                      !formCourse 
                        ? "เลือกวิชาก่อน" 
                        : (availableStudentOptions.length===0
                            ? "นักศึกษาลงทะเบียนรายวิชานี้ครบแล้ว"
                            :"ค้นหา/เลือกนักศึกษา")} 
                    />
                  }
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  {availableStudentOptions.length === 0 && <ComboboxEmpty>ไม่พบนักศึกษา.</ComboboxEmpty>}
                  <ComboboxList>
                    {availableStudentOptions.map((item) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>


            </div>
            
          </div>
          <DialogFooter>
            <Button disabled={(formStudent.length == 0) || !formCourse} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudent.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead>จำนวน นศ.</TableHead>
            <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses
            .filter((c) => {
              if (mode === "course") {
                return filterCourse === "all" || c.courseCode === filterCourse;
              }
              if (filterStudent === "all") return true;
              const targetStudent = students.find((s) => s.studentId === filterStudent);
              return targetStudent?.enrolledCourses.includes(c.courseCode);
            })
            .map((course) => {
              const enrolledStudents = students.filter(
                (s) =>
                  s.enrolledCourses.includes(course.courseCode)
              );

              if (mode === "student" && filterStudent !== "all" && enrolledStudents.length === 0) {
                return null;
              }

              return (
                <TableRow key={course.courseCode}>
                  <TableCell className="font-medium">{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">                      
                      {enrolledStudents.length === 0 
                        ? <span className="text-xs text-muted-foreground">ยังไม่มีผู้ลงทะเบียน</span> 
                        : enrolledStudents.map((s) => (
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border dark:border-blue-300 border-blue-700">
                            {s.firstName} {s.lastName}  
                            <button 
                              className="-mr-0.5 rounded-full hover:text-destructive text-xs"
                              onClick={()=>drop(s.studentId, course.courseCode)}
                            >
                              <X data-icon="inline-end" size={16}/>
                            </button>
                          </Badge>
                      ))} 
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
