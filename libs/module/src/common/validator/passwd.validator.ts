import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint()
export class PasswordValidator implements ValidatorConstraintInterface {
    validate(passwd: string): boolean | Promise<boolean> {
        try {
            const passwdRegex = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
            if (!passwdRegex.test(passwd)) return false;
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    defaultMessage(): string {
        return '비밀번호는 10자 이상, 영어 대소문자, 특수문자, 숫자가 최소 1개씩 포함돼 있어야합니다.';
    }
}
