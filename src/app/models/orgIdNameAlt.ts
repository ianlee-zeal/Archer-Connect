import { IdValue } from "./idValue";

export class OrgIdNameAlt extends IdValue {
  alternativeName: string;

  constructor(id: number, name: string, alternativeName: string) {
    super(id, name);
    this.alternativeName = alternativeName;
  }

  public getQsfOrgName(): string{
    return OrgIdNameAlt.getQsfOrgName(this.name, this.alternativeName);
  }

  public static getQsfOrgName(name: string, alternativeName: string): string{
    if(alternativeName) {
      return `${name} / ${alternativeName}`;
    }

    return name;
  }
}
