// one visible hierarchy step shared with breadcrumb structured data
export interface IBreadcrumbItem {
  name: string;
  path: string;
}

// structured page categories supported by the shared metadata layout
export type IStructuredDataType = 'website' | 'webpage';

// values required to build one truthful page-level JSON-LD object
export interface IStructuredDataOptions {
  breadcrumbs?: readonly IBreadcrumbItem[] | undefined;
  canonicalUrl: string;
  description: string;
  title: string;
  type: IStructuredDataType;
}
