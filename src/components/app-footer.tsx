import type {Footer} from "../lib/types";

export function AppFooter({firstName, lastName, studentId}:Footer){
    return (
        <footer className="border-t p-4 text-center text-xs text-muted-foreground">
            จัดทำโดย {firstName} {lastName} - รหัสนักศึกษา {studentId}
        </footer>
    );
}