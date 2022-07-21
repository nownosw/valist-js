import { z } from 'zod';
import { ApolloCache } from '@apollo/client';
import { ProjectMeta, GalleryMeta, Client } from '@valist/sdk';
import { handleEvent } from './events';
import * as utils from './utils';

export interface FormValues {
  projectName: string;
  displayName: string;
  website: string;
  description: string;
  shortDescription: string;
  youTubeLink: string;
}

export const schema = z.object({
  projectName: z.string()
    .min(3, { message: 'Project name should have at least 3 characters' })
    .max(24, { message: 'Project name should not be longer than 24 characters' })
    .regex(/^[\w-]+$/g, { message: 'Project name can only contain letters, numbers, and dashes' })
    .refine((val) => val.toLocaleLowerCase() === val, { message: 'Project name can only contain lowercase letters' }),
  displayName: z.string()
    .min(3, { message: 'Display name should have at least 3 characters' })
    .max(24, { message: 'Display name should not be longer than 32 characters' }),
  website: z.string(),
  description: z.string(),
  youTubeLink: z.string()
    .refine(utils.refineYouTube, { message: 'YouTube link format is invalid.' }),
  shortDescription: z.string()
    .max(100, { message: 'Description should be shorter than 100 characters' }),
});

export async function createProject(
  address: string | undefined,
  accountId: string | undefined,
  image: File | string | undefined,
  mainCapsule: File | string | undefined,
  gallery: (File | string)[],
  members: string[],
  values: FormValues,
  valist: Client,
  cache: ApolloCache<any>,
): Promise<boolean | undefined> {
  try {
    utils.hideError();

    if (!address) {
      throw new Error('connect your wallet to continue');
    }

    if (!accountId) {
      throw new Error('create an account to continue');
    }

    const meta: ProjectMeta = {
      name: values.displayName,
      description: values.description,
      external_url: values.website,
      gallery: [],
    };

    utils.showLoading('Uploading files');
    if (image) {
      meta.image = await utils.writeFile(image, valist);
    }

    if (mainCapsule) {
      meta.main_capsule = await utils.writeFile(mainCapsule, valist);
    }

    if (values.youTubeLink) {
      const src = values.youTubeLink;
      meta.gallery?.push({ name: '', type: 'youtube', src });
    }

    for (const item of gallery) {
      const src = await utils.writeFile(item, valist);
      meta.gallery?.push({ name: '', type: 'image', src });
    }

    utils.updateLoading('Waiting for transaction');
    const transaction = await valist.createProject(accountId, values.projectName, meta, members);
    const receipt = await transaction.wait();
    receipt.events?.forEach(event => handleEvent(event, cache));

    return true;
  } catch(error: any) {
    utils.showError(error);
    console.log(error);
  } finally {
    utils.hideLoading();
  }
}