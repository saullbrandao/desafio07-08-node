import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { OperationType } from './CreateStatementController';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    )
  })

  it("should be able to make a deposit", async () => {
    const password = await hash("123456", 8);

    const user = await usersRepository.create({
      email: "john@example.com",
      name: "John Doe",
      password
    })

    const deposit = await createStatementUseCase.execute({
      user_id:     user.id as string,
      type:        "deposit" as OperationType,
      description: "Salary",
      amount:      100
    })

    expect(deposit).toHaveProperty("id")
    expect(deposit.user_id).toBe(user.id)
    expect(deposit.amount).toBe(100)
    expect(deposit.type).toBe("deposit")
  })

  it("should be able to make a withdraw", async () => {
    const password = await hash("123456", 8);

    const user = await usersRepository.create({
      email: "john@example.com",
      name: "John Doe",
      password
    })

    await createStatementUseCase.execute({
      user_id:     user.id as string,
      type:        "deposit" as OperationType,
      description: "Salary",
      amount:      100
    })

    const withdraw = await createStatementUseCase.execute({
      user_id:     user.id as string,
      type:        "withdraw" as OperationType,
      description: "Groceries",
      amount:      50
    })

    expect(withdraw).toHaveProperty("id")
    expect(withdraw.user_id).toBe(user.id)
    expect(withdraw.amount).toBe(50)
    expect(withdraw.type).toBe("withdraw")
  })


  it("should not be able to make a statement if the user does not exists", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id:     "non-existing-user-id",
        type:        "deposit" as OperationType,
        description: "Salary",
        amount:      100
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to make a withdraw if the amount is more than the user's balance", () => {
    expect(async () => {
      const password = await hash("123456", 8);

      const user = await usersRepository.create({
        email: "john@example.com",
        name: "John Doe",
        password
      })

      await createStatementUseCase.execute({
        user_id:     user.id as string,
        type:        "withdraw" as OperationType,
        description: "Salary",
        amount:      100
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
