export const SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';

export const SCIM_GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group';

export const SCIM_LIST_RESPONSE_SCHEMA =
  'urn:ietf:params:scim:api:messages:2.0:ListResponse';

export const SCIM_ERROR_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:Error';

export interface ScimUserInput {
  active?: boolean;
  displayName?: string;
  externalId?: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  schemas: string[];
  userName: string;
}

export interface ScimUser extends ScimUserInput {
  active: boolean;
  id: string;
  meta: {
    created: string;
    lastModified: string;
    location: string;
    resourceType: 'User';
  };
}

export interface ScimGroupMember {
  display?: string;
  type?: 'User';
  value: string;
}

export interface ScimGroupInput {
  displayName: string;
  externalId?: string;
  members?: ScimGroupMember[];
  schemas: string[];
}

export interface ScimGroup extends ScimGroupInput {
  id: string;
  members: ScimGroupMember[];
  meta: {
    created: string;
    lastModified: string;
    location: string;
    resourceType: 'Group';
  };
}

export interface ScimListResponse<T> {
  Resources: T[];
  itemsPerPage: number;
  schemas: [typeof SCIM_LIST_RESPONSE_SCHEMA];
  startIndex: number;
  totalResults: number;
}

export interface ScimError {
  detail: string;
  schemas: [typeof SCIM_ERROR_SCHEMA];
  scimType?: string;
  status: string;
}
