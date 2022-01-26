import { hash } from 'bcryptjs'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ICreateUserDTO } from '../createUser/ICreateUserDTO'
import { ShowUserProfileError } from './ShowUserProfileError'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase'

let usersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it("should be able to show an user profile", async () => {
    const password = await hash("123456", 8);

    const userData: ICreateUserDTO = {
      email: "john@example.com",
      name: "John Doe",
      password
    }

    const user = await usersRepository.create(userData)

    const userProfile = await showUserProfileUseCase.execute(user.id as string)

    expect(userProfile).toHaveProperty("id")
  })

  it("should not be able to show an user profile if the user does not exists",  () => {
    expect(async() => {
      await showUserProfileUseCase.execute('non-existing-user-id')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
