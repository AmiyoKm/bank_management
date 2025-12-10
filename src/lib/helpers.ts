export const generateAccountNumber = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.floor(
        Math.random() * 1000
    )}`;
}
