import { Account, AccountType, Role } from "../../generated/prisma/client";
import * as AccountRepository from "../repository/accounts";
import { findUserById } from "../repository/user";
import { HttpError } from "../lib/errors";
import { User } from "../models/user";

export const createAccount = async (
	type: AccountType,
	balance: number,
	userId: number,
): Promise<Account> => {
	const user = await findUserById(userId);
	if (!user) {
		throw new HttpError(404, "User not found to associate with account.");
	}
	return AccountRepository.createAccount(type, balance, userId);
};

export const getAccounts = async (
	page: number,
	limit: number,
	sort: string,
	name?: string,
	type?: AccountType,
): Promise<Account[]> => {
	return AccountRepository.findAll(page, limit, sort, name, type);
};

export const getAccountById = async (
	id: number,
	requestingUser: User,
): Promise<Account> => {
	const account = await AccountRepository.findById(id);
	if (!account) {
		throw new HttpError(404, "Account not found");
	}

	if (
		requestingUser.role === Role.CUSTOMER &&
		account.userId !== requestingUser.id
	) {
		throw new HttpError(
			403,
			"Forbidden: You can only view your own accounts.",
		);
	}

	return account;
};

export const getMyAccounts = async (userId: number): Promise<Account[]> => {
	return AccountRepository.findAllByUserId(userId);
};

export const updateAccount = async (
	id: number,
	type: string,
	amount: number,
): Promise<Account> => {
	const account = await AccountRepository.findById(id);
	if (!account) {
		throw new HttpError(404, "Account not found");
	}

	if (type === "DEBIT" && amount > Number(account.balance)) {
		throw new HttpError(400, "Insufficient balance");
	}

	const updatedAccount = await AccountRepository.updateAccount(
		id,
		type,
		amount,
		account,
	);
	return updatedAccount;
};

export const deleteAccountById = async (id: number): Promise<void> => {
	const account = await AccountRepository.findById(id);
	if (!account) {
		throw new HttpError(404, "Account not found");
	}

	if (Number(account.balance) > 0) {
		throw new HttpError(
			400,
			"Cannot delete account with a positive balance. Please withdraw funds first.",
		);
	}

	try {
		await AccountRepository.deleteAccount(id);
	} catch (e: any) {
		if (e.code === "P2003" || e.code === "P2014") {
			throw new HttpError(
				400,
				"Cannot delete account. It has associated transactions or loans.",
			);
		}
		throw e;
	}
};
