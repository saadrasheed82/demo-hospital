export const generateNextToken = (lastToken) => {
  if (!lastToken) return '101'
  const num = parseInt(lastToken, 10)
  return String(num + 1).padStart(3, '0')
}

export const parseTokenNumber = (token) => parseInt(token, 10)

export const reorderNoShow = (queue, tokenId) => {
  const reordered = queue.filter(t => t.id !== tokenId)
  const noShowToken = queue.find(t => t.id === tokenId)
  const lastTokenNum = Math.max(...queue.map(t => parseTokenNumber(t.token)), 100)
  const newToken = generateNextToken(String(lastTokenNum))

  const updated = {
    ...noShowToken,
    token: newToken,
    status: 'end_of_queue',
    originalToken: noShowToken.token
  }
  reordered.push(updated)
  return reordered
}
