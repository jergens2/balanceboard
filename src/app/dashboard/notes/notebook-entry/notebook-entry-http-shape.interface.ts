export interface NotebookEntryHttpShape{
    _id: string,
    userId: string,
    journalDate: string,
    dateCreated: string,
    dateModified: string,
    type: any,
    textContent: string,
    title: string,
    tags: string[],
    data: any,
}