import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ICreateUserDTO } from '../createUser/ICreateUserDTO'
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase'
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError'

let usersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it("should be able to authenticate an user", async () => {
    const password = await hash("123456", 8);

    const user: ICreateUserDTO = {
      email: "john@example.com",
      name: "John Doe",
      password
    }

    await usersRepository.create(user)

    const result = await authenticateUserUseCase.execute({
      email: "john@example.com",
      password: "123456"
    })

    expect(result).toHaveProperty("token")
  })

  it("should not be able to authenticate if the user does not exists", () => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "john@example.com",
        password: "123456"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate if the password does not match", () => {
    expect(async() => {
      const password = await hash('123456', 8);

      const user: ICreateUserDTO = {
        email: "john@example.com",
        name: "John Doe",
        password
      }

      await usersRepository.create(user)

      await authenticateUserUseCase.execute({
        email: "john@example.com",
        password: "123"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
