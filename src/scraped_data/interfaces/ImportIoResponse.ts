export interface ImportIoReponse {
    extractorData: ExtractorData;
    pageData: PageData;
    url: string;
    inputs: Inputs;
    timestamp: number;
    sequenceNumber: number;
    crawlUrl: string;
  }
  export interface ExtractorData {
    url: string;
    data?: (DataEntity)[] | null;
  }
  export interface DataEntity {
    group?: (GroupEntity)[] | null;
    screenCapture: string;
  }
  export interface GroupEntity {
    suiteCommerceTag?: (GroupEntityField)[] | null;
    prodbundle_id?: (GroupEntityField)[] | null;
    base_label?: (GroupEntityField)[] | null;
    application_ld_json?: (GroupEntityField)[] | null;
    version?: (GroupEntityField)[] | null;
    date_label?: (GroupEntityField)[] | null;
    build_no?: (GroupEntityField)[] | null;
    companyId?: (GroupEntityField)[] | null;
    div_id_main?: (GroupEntityField)[] | null;
    div_class_main?: (GroupEntityField)[] | null;
    cookies?: (GroupEntityField)[] | null;
    canonical_url?: (GroupEntityField)[] | null;
    title?: (GroupEntityField)[] | null;
    seoGenerator?: (GroupEntityField)[] | null;
    gotResponseFromPrerender?: (GroupEntityField)[] | null;
    Governance?: (GroupEntityField)[] | null;
    perfTiming?: (GroupEntityField)[] | null;
    searchRequest?: (GroupEntityField)[] | null;
    SSPAppContext?: (GroupEntityField)[] | null;
    eCommerceType?: (GroupEntityField)[] | null;
    subRequestStatus?: (GroupEntityField)[] | null;
    backgroundRequests?: (GroupEntityField)[] | null;
    consoleContent?: (GroupEntityField)[] | null;
    isCNameProperlyMapped?: (GroupEntityField)[] | null;
    cNameTestWithUrl?: (GroupEntityField)[] | null;
    isHttpS?: (GroupEntityField)[] | null;
  }
  export interface GroupEntityField {
    text: string;
    xpath: string;
  }
  export interface PageData {
    statusCode: number;
    timestamp: number;
  }
  export interface Inputs {
    _url: string;
  }
  