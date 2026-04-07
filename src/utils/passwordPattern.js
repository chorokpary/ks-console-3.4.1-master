import PasswordPolicyStore from 'stores/passwordPolicy'

export const getPasswordErrorMessage = async () => {
  const passwordPolicyStore = new PasswordPolicyStore()
  const policyData = await passwordPolicyStore.getPasswordPolicy()

  if (!policyData) return null

  const errorMessage =
    buildPasswordPolicyMessage({ ...policyData }) ?? t('PASSWORD_DESC')

  return errorMessage
}

export const getPasswordPolicy = async () => {
  const passwordPolicyStore = new PasswordPolicyStore()
  const policyData = await passwordPolicyStore.getPasswordPolicy()

  if (!policyData) return null

  return policyData
}

export const getPasswordRegex = async () => {
  const passwordPolicyStore = new PasswordPolicyStore()
  const policyData = await passwordPolicyStore.getPasswordPolicy()

  if (!policyData) return null

  const minLength = Number(policyData.minLength ?? 8)
  const maxLength = Number(policyData.maxLength ?? 64)
  const minUpper = Number(policyData.uppercaseCount ?? 0)
  const minLower = Number(policyData.lowercaseCount ?? 0)
  const minDigit = Number(policyData.minNum ?? 0)
  const minSpecial = Number(policyData.special ?? 0)
  const specialSet = policyData.symbol ?? ''

  const escapeForRegex = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

  const escapedSpecial = escapeForRegex(specialSet)

  const pattern =
    `^(?=(?:.*[A-Z]){${minUpper},})` +
    `(?=(?:.*[a-z]){${minLower},})` +
    `(?=(?:.*\\d){${minDigit},})` +
    (minSpecial > 0 ? `(?=(?:.*[${escapedSpecial}]){${minSpecial},})` : '') +
    `[A-Za-z\\d${escapedSpecial}]{${minLength},${maxLength}}$`

  return new RegExp(pattern)
}

export const buildPasswordPolicyMessage = ({
  minNum = 0,
  minLower = 0,
  minUpper = 0,
  special = 0,
  minLength,
  maxLength,
  symbol,
}) => {
  const rules = []

  if (minNum > 0) {
    rules.push(t('USER_CREATE_MINNUM', { minNum }))
  }
  if (minLower > 0) {
    rules.push(t('USER_CREATE_MINLOWER', { minLower }))
  }
  if (minUpper > 0) {
    rules.push(t('USER_CREATE_MINUPPER', { minUpper }))
  }
  if (special > 0) {
    rules.push(
      t('USER_CREATE_MINSPECIAL', {
        special,
        symbol,
      })
    )
  }

  const ruleText =
    rules.length > 0 ? t('USER_CREATE_RULE', { rules: rules.join(', ') }) : ''

  const lengthText = t('USER_CREATE_LENGTHTEXT', {
    minLength,
    maxLength,
  })

  return `${ruleText}${lengthText}`
}
