export interface Roll20Attribute {
  name: string;
  current: string | number;
  max?: string | number;
  id?: string;
}

export interface Roll20Ability {
  name: string;
  description?: string;
  action?: string;
  istokenaction?: boolean;
  id?: string;
}

export interface Roll20Character {
  schema_version?: number;
  name?: string;
  avatar?: string;
  oldId?: string;
  attribs?: Roll20Attribute[];
  attributes?: Roll20Attribute[];
  character?: {
    name: string;
    avatar?: string;
    [key: string]: any;
  };
  abilities?: Roll20Ability[];
  [key: string]: any; // Catch-all for any other arbitrary fields Roll20 uses
}
