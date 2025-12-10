import { Account, AccountType } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const createAccount = async (
	type: AccountType,
	balance: number,
	userId: number,
): Promise<Account> => {
	let accountNumber;
	let existingAccount;
	do {
		accountNumber = Math.floor(
			1000000000 + Math.random() * 9000000000,
		).toString();
		existingAccount = await findByAccountNumber(accountNumber);
	} while (existingAccount);

	return prisma.account.create({
		data: {
			userId,
			type,
			balance,
			accountNumber,
		},
	});
};

export const findById = async (id: number): Promise<Account | null> => {
	return prisma.account.findUnique({ where: { id } });
};

export const findByAccountNumber = async (
	accountNumber: string,
): Promise<Account | null> => {
	return prisma.account.findUnique({ where: { accountNumber } });
};

export const findAll = async (
	page: number,
	limit: number,
	sort: string,
	name?: string,
	type?: AccountType,
): Promise<Account[]> => {
	return prisma.account.findMany({
		where: {
			...(type ? { type } : {}),
			...(name
				? {
						user: {
							OR: [
								{
									firstName: {
										contains: name,
										mode: "insensitive",
									},
								},
								{
									lastName: {
										contains: name,
										mode: "insensitive",
									},
								},
							],
						},
					}
				: {}),
		},
		skip: (page - 1) * limit,
		take: limit,
		orderBy: {
			createdAt: sort === "asc" ? "asc" : "desc",
		},
		include: {
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
	});
};

export const findAllByUserId = async (userId: number): Promise<Account[]> => {
	return prisma.account.findMany({ where: { userId } });
};

export const updateAccount = async (
	id: number,
	type: string,
	amount: number,
	account: Account,
): Promise<Account> => {
	
	return prisma.account.update({
		where: { id },
		data: {
			balance: type === "DEBIT" ? Number(account.balance) - amount : Number(account.balance) + amount,
		},
	});
};

export const deleteAccount = async (id: number): Promise<Account> => {
	return prisma.account.delete({ where: { id } });
};
