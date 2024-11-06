import { faker } from "@faker-js/faker"
import prisma from "../lib/prismadb"
import { hash } from "bcrypt"

class ErrorHandler extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    // Set the prototype explicitly for better compatibility with built-in Error
    Object.setPrototypeOf(this, ErrorHandler.prototype)
  }
}

const generateFakeUsers = async (count: number) => {
  const record = await prisma.user.findFirst({
    where: {
      username: {
        startsWith: "fake-",
      },
    },
  })

  if (record) return

  const password = await faker.internet.password()
  const hashedPassword = await hash(password, 10)

  const fakeUsers = await Promise.all(
    Array.from({ length: count }).map(async () => ({
      name: "Fk. " + faker.person.fullName(),
      username: "fake-" + faker.internet.username(),
      email: faker.internet.email(),
      password: hashedPassword,
    }))
  )

  await prisma.user.createMany({
    data: fakeUsers,
  })
}

type FakePost = {
  title: string
  content: string
  authorId: string
}

const generateFakePosts = async () => {
  const recordPost = await prisma.post.findFirst({
    where: {
      title: {
        startsWith: "Fake P.",
      },
    },
  })

  if (recordPost) return

  let fakeUsers = await prisma.user.findMany({
    where: {
      username: {
        startsWith: "fake-",
      },
    },
  })

  fakeUsers = fakeUsers.map((user) => ({
    ...user,
  }))

  let fakePosts: FakePost[] = []

  const allUserPosts = await Promise.all(
    fakeUsers.map(async (user) => {
      const NUMBER_OF_POSTS = Math.floor(Math.random() * 10) + 1

      const userPosts = Array.from({ length: NUMBER_OF_POSTS }).map(() => ({
        title: "Fake P. " + faker.lorem.sentence(),
        content:
          NUMBER_OF_POSTS % 2 === 0
            ? faker.food.description()
            : faker.commerce.productDescription(),
        authorId: user.id,
      }))

      return userPosts
    })
  )

  // Flatten the array and store in fakePosts
  fakePosts = allUserPosts.flat()

  await prisma.post.createMany({
    data: fakePosts,
  })
}

export { ErrorHandler, generateFakeUsers, generateFakePosts }
