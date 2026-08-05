export type AuthInput = {
    email: string,
    password: string
}

export type SignInData = {
    userId: string,
    username: string
}

export type AuthResult = {
    accessToken: string,
    userId: string,
    username: string
}

export type SignInInput = {
    email: string,
    username: string,
    password: string,
}