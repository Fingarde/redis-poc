import { User } from '@prisma/client';
import UserRepository from '../repository/user';
import { UserCreate } from '../types/user';

async function getAll(): Promise<User[]> {
    return await UserRepository.getAllUsers();
}

async function get(id: number): Promise<User | null> {
    const user = await UserRepository.getUser(id);

    if (!user) {
        return Promise.reject({
            status: 404,
            message: 'User not found'
        });
    }
    
    return user;
}

async function create(userCreate: UserCreate): Promise<User> {
    if (await UserRepository.alreadyExists(userCreate.email)) {
        return Promise.reject({
            status: 400,
            message: 'User already exists'
        });
    }
    
    return UserRepository.createUser(userCreate);
}

export default {
    getAll,
    get,
    create
}