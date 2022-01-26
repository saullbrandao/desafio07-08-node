import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      password: "123456",
      email: "john@example.com"
     })

    expect(user).toHaveProperty("id")
  })

  it("should not be able to create a user with a email already registered", ()=>{
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        password: "123456",
        email: "john@example.com"
      })

      await createUserUseCase.execute({
        name: "John Doe",
        password: "123456",
        email: "john@example.com"
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
