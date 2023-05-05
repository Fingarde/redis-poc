import { User } from '@prisma/client';
import UserRepository from '../repository/user';
import { UserCreate } from '../types/user';
import { Error } from '../types/error';

async function getAll(): Promise<User[]> {
    return await UserRepository.getAllUsers();
}

export async function getUser(id: number): Promise<User | Error> {
    const user = await UserRepository.getUser(id as number);

    if (!user) { return { code: 404, message: 'User not found' } }
    
    return user;
}

export async function create(userCreate: UserCreate): Promise<User> {
    if (await UserRepository.alreadyExists(userCreate.email)) {
        return Promise.reject({
            status: 400,
            message: 'User already exists'
        });
    }
    
    return UserRepository.createUser(userCreate);
}
