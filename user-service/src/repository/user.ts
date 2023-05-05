import { PrismaClient, User } from '@prisma/client'
import { UserCreate } from '../types/user'

const prisma = new PrismaClient()

async function getAllUsers(): Promise<User[]> {
  return await prisma.user.findMany()
}

async function getUser(id: number): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id) ,
      }
    })

    return user
  } catch (err) {
    console.log(err)
  }
  return null
  
}

async function createUser(userCreate: UserCreate): Promise<User> {
  const user = await prisma.user.create({
    data: userCreate,
  })

  return user
}

async function alreadyExists(email: string): Promise<boolean> {
  const user = await prisma.user.findFirst({ where: { email } })

  return !!user
}

export default {
  getAllUsers,
  getUser,
  createUser,
  alreadyExists,
} 