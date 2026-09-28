import { create } from "zustand";
import { persist } from 'zustand/middleware';

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  // add course
  addCourse: (newCourse : Course) => void;
  updateCourseInstructors: (courseCode: string, instructors: string[]) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
    students: initialStudents,
    courses: initialCourses,

    enroll: (studentId, courseCode) =>
      set((state) => ({
        students: state.students.map((s) => 
          s.studentId === studentId ? 
            {
              ...s,
              enrolledCourses: s.enrolledCourses.includes(courseCode)
                ? s.enrolledCourses
                : [...s.enrolledCourses, courseCode],
            } : s  
        )
      })),

    drop: (studentId, courseCode) =>
      set((state) => ({
        students: state.students.map( (s) =>
          s.studentId === studentId ? {
            ...s,
            enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode)
          } : s
        )
      })),

    removeStudent: (studentId) =>
      set((state) => ({
        students: state.students.filter((s) => s.studentId !== studentId),
      })),

    removeCourse: (courseId) =>
      set((state) => ({
        courses: state.courses.filter((c) => c.courseCode !== courseId),
        students: state.students.map((s) => ({
          ...s,
          enrolledCourses: s.enrolledCourses.filter((c) => c !== courseId),
        })),
      })),

    addCourse: (newCourse: Course) =>
      set((state) => ({
        courses: [...state.courses, newCourse],
    })),

    updateCourseInstructors: (courseCode: string, instructors: string[]) =>
    set((state) => ({
    courses: state.courses.map((c) =>
      c.courseCode === courseCode ? { ...c, instructors } : c
    ),
  })),

    }),
    {
      name: 'lab16-2569-680610712',
      partialize: (state) => ({
        students: state.students, 
        courses: state.courses,  
      }),
    }
  )
);
