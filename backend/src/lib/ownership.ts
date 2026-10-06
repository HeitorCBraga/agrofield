import { prisma } from "./prisma.js";

export async function getOwnedProperty(propertyId: string, ownerId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  return property && property.ownerId === ownerId ? property : null;
}

export async function getOwnedPlot(plotId: string, ownerId: string) {
  const plot = await prisma.plot.findUnique({ where: { id: plotId }, include: { property: true } });
  return plot && plot.property.ownerId === ownerId ? plot : null;
}

export async function getOwnedCrop(cropId: string, ownerId: string) {
  const crop = await prisma.crop.findUnique({
    where: { id: cropId },
    include: { plot: { include: { property: true } } },
  });
  return crop && crop.plot.property.ownerId === ownerId ? crop : null;
}

export async function getOwnedInputApplication(inputApplicationId: string, ownerId: string) {
  const inputApplication = await prisma.inputApplication.findUnique({
    where: { id: inputApplicationId },
    include: { crop: { include: { plot: { include: { property: true } } } } },
  });
  return inputApplication && inputApplication.crop.plot.property.ownerId === ownerId ? inputApplication : null;
}

export async function getOwnedHarvest(harvestId: string, ownerId: string) {
  const harvest = await prisma.harvest.findUnique({
    where: { id: harvestId },
    include: { crop: { include: { plot: { include: { property: true } } } } },
  });
  return harvest && harvest.crop.plot.property.ownerId === ownerId ? harvest : null;
}
