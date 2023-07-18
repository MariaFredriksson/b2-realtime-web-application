import '../socket.io/socket.io.js'

// Create a socket connection using Socket.IO.
const socket = window.io()

// Listen for "snippet/close" message from the server.
socket.on('snippet/close', (issueIid) => changeIssueState('closed', issueIid))

// Listen for "snippet/open" message from the server.
socket.on('snippet/open', (issueIid) => changeIssueState('opened', issueIid))

/**
 * Change the issue state in the table.
 *
 * @param {string} newState The new state of the issue.
 * @param {number} issueIid The issue ID.
 */
function changeIssueState (newState, issueIid) {
  console.log('Hej!')

  const issueList = document.querySelector('#issue-list')

  console.log(issueList)
  console.log(issueIid)

  // Find the corresponding row in the table using the issueId
  const issueRow = issueList.querySelector(`[data-id="${issueIid}"]`)

  console.log(issueRow)

  if (issueRow) {
    // Update the issue state in the table
    const stateCell = issueRow.querySelector('.state-column')
    stateCell.textContent = newState
  }
}
