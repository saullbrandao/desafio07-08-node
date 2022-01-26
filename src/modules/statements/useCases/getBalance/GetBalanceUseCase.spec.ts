import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { OperationType } from '../createStatement/CreateStatementController';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository
let getBalanceUseCase: GetBalanceUseCase

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it("should be able to get the balance from an user account", async () => {
    const password = await hash("123456", 8);

    const user = await usersRepository.create({
      email: "john@example.com",
      name: "John Doe",
      password
    })

    await statementsRepository.create({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      description: "Salary",
      amount: 100
    })

    const balance = await getBalanceUseCase.execute({ user_id: user.id as string })

    expect(balance.balance).toBe(100)
    expect(balance.statement).toHaveLength(1)
  })

  it("should not be able to get the balance if the user does not exists", () => {
    expect(async() => {
      await getBalanceUseCase.execute({ user_id: "non-existing-user"})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
