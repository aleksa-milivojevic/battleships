export type AuthInput = {
    email: string,
    password: string
}

export type SignInData = {
    userId: string,
    username: string
}

export type SafeUserDto = {
    id: string,
    email: string,
    username: string,
    score: number,
    admin: boolean,
    banned: boolean,
    timeout: number,
    createdAt: Date
}

export type AuthResult = {
    accessToken: string,
    refreshToken: string,
    user: SafeUserDto
}

export type SignInInput = {
    email: string,
    username: string,
    password: string,
}

export type RefreshResponse = {
    accessToken: string,
    refreshToken: string
}