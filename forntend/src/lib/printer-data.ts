// Import all printer data
import crealityPrinters from '@/printers/creality_printers.json';
import prusaPrinters from '@/printers/prusa_research_printers.json';
import bambuLabPrinters from '@/printers/bambu_lab_printers.json';
import anycubicPrinters from '@/printers/anycubic_printers.json';
import elegooPrinters from '@/printers/elegoo_printers.json';
import flashforgePrinters from '@/printers/flashforge_printers.json';
import lulzbotPrinters from '@/printers/lulzbot_printers.json';
import ultimakerPrinters from '@/printers/ultimaker_printers.json';
import qidiTechPrinters from '@/printers/qidi_tech_printers.json';
import sovolPrinters from '@/printers/sovol_printers.json';

export interface PrinterModel {
  model: string;
  build_volume: string;
  multi_color: boolean;
  notes: string;
}

export interface PrinterBrand {
  brand: string;
  models: PrinterModel[];
}

// Organize printer data by brand
export const printerBrands: PrinterBrand[] = [
  {
    brand: 'Creality',
    models: crealityPrinters.creality_printers.FDM_printers
  },
  {
    brand: 'Prusa Research',
    models: prusaPrinters.prusa_research_printers
  },
  {
    brand: 'Bambu Lab',
    models: bambuLabPrinters.bambu_lab_printers
  },
  {
    brand: 'Anycubic',
    models: anycubicPrinters.anycubic_printers
  },
  {
    brand: 'Elegoo',
    models: elegooPrinters.elegoo_printers
  },
  {
    brand: 'Flashforge',
    models: flashforgePrinters.flashforge_printers
  },
  {
    brand: 'LulzBot',
    models: lulzbotPrinters.lulzbot_printers
  },
  {
    brand: 'Ultimaker',
    models: ultimakerPrinters.ultimaker_printers
  },
  {
    brand: 'Qidi Tech',
    models: qidiTechPrinters.qidi_tech_printers
  },
  {
    brand: 'Sovol',
    models: sovolPrinters.sovol_printers
  }
];

// Get all available brands
export const getAvailableBrands = (): string[] => {
  return printerBrands.map(brand => brand.brand);
};

// Get models for a specific brand
export const getModelsForBrand = (brandName: string): PrinterModel[] => {
  const brand = printerBrands.find(b => b.brand === brandName);
  return brand ? brand.models : [];
};

// Get a specific model by brand and model name
export const getModelDetails = (brandName: string, modelName: string): PrinterModel | null => {
  const models = getModelsForBrand(brandName);
  return models.find(model => model.model === modelName) || null;
};

// Get all models across all brands
export const getAllModels = (): { brand: string; model: PrinterModel }[] => {
  return printerBrands.flatMap(brand => 
    brand.models.map(model => ({
      brand: brand.brand,
      model
    }))
  );
};
