import { BannerTextTypeEnum } from "../enums/banner-text-type.enum";

export class MaintenanceBanner {
    id: number;
    isActive: boolean;
    maintenanceBannerType: BannerTextTypeEnum;
    name: string;
    description: string;
}