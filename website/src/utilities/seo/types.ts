// one visible hierarchy step shared with breadcrumb structured data
export interface IBreadcrumbItem {
  name: string;
  path: string;
}

// one page a website lists in its item list, in display order
export interface IListedPage {
  name: string;
  path: string;
}

// the skill a skill page documents, described as source code in the repository
export interface IStructuredDataSkill {
  name: string;
  stage: string;
}

// structured page categories supported by the shared metadata layout
export type IStructuredDataType = 'website' | 'webpage';

// values required to build one truthful page-level JSON-LD object
export interface IStructuredDataOptions {
  breadcrumbs?: readonly IBreadcrumbItem[] | undefined;
  canonicalUrl: string;
  description: string;
  listedPages?: readonly IListedPage[] | undefined;
  skill?: IStructuredDataSkill | undefined;
  title: string;
  type: IStructuredDataType;
}
