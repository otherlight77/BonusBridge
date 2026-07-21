export function clearHistory(state,persist){state.history=[];persist(state)}
export function removeHistoryItem(state,id,persist){state.history=state.history.filter(item=>item.id!==id);persist(state)}
