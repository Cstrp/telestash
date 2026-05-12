export interface File {
  id: number;
  folderId: number;

  name: string;
  size: number;
  mimeType: string;
  extension: string;
  icon: string;

  createdAt: string;
}
