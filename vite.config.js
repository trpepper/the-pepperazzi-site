import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const heroMediaModuleId = 'virtual:hero-media';
const portfolioMediaModuleId = 'virtual:portfolio-media';
const clientGalleriesModuleId = 'virtual:client-galleries';
const resolvedHeroMediaModuleId = `\0${heroMediaModuleId}`;
const resolvedPortfolioMediaModuleId = `\0${portfolioMediaModuleId}`;
const resolvedClientGalleriesModuleId = `\0${clientGalleriesModuleId}`;

const imageExtensions = new Set(['.avif', '.gif', '.jpg', '.jpeg', '.png', '.webp']);
const videoExtensions = new Set(['.mp4', '.mov', '.webm']);
const videoMimeTypes = {
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};
const defaultClientGalleryOffer = {
  freeImages: 3,
  offerText:
    'Your package includes 3 full resolution images. Additional selected images are £10 each.',
  pricePerImage: 10,
  priceForAllImages: null,
};

const fallbackHeroSlides = [
  {
    id: 'fallback-wedding-party',
    type: 'image',
    label: 'Wedding party',
    alt: 'Wedding party gathered beneath a ceremony arch',
    src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=2200&q=85',
    fallback:
      'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=2200&q=85',
  },
  {
    id: 'fallback-family-session',
    type: 'image',
    label: 'Family session',
    alt: 'Family portrait session outdoors',
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2200&q=85',
    fallback:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2200&q=85',
  },
];

const fallbackPortfolioItems = [
  {
    id: 'fallback-wedding-arch',
    type: 'image',
    category: 'wedding',
    label: 'Wedding Arch',
    alt: 'Wedding ceremony under an arch by The Pepperazzi',
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    transitionName: 'portfolio-fallback-wedding-arch',
  },
  {
    id: 'fallback-family-session',
    type: 'image',
    category: 'family',
    label: 'Family Session',
    alt: 'Family portrait session outdoors by The Pepperazzi',
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    transitionName: 'portfolio-fallback-family-session',
  },
  {
    id: 'fallback-pets',
    type: 'image',
    category: 'pets',
    label: 'Pets',
    alt: 'Pet portrait session outdoors by The Pepperazzi',
    src: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
    transitionName: 'portfolio-fallback-pets',
  },
];

function isMediaFile(filename) {
  const extension = path.extname(filename).toLowerCase();

  return imageExtensions.has(extension) || videoExtensions.has(extension);
}

function isImageFile(filename) {
  const extension = path.extname(filename).toLowerCase();

  return imageExtensions.has(extension);
}

function isPosterFile(filename) {
  const basename = path.basename(filename, path.extname(filename));

  return basename.toLowerCase().endsWith('-poster');
}

function sortFiles(files) {
  return files.sort((first, second) =>
    first.localeCompare(second, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

function toTitle(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/^\d+[-_\s.]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toSafeIdent(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

function getFirstDefinedValue(source, keys) {
  return keys.find((key) => source[key] !== undefined);
}

function normalizeNonNegativeNumber(value, fallbackValue) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallbackValue;
}

function normalizeOptionalNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
}

function getClientGalleryOffer(galleryDir) {
  const offerPath = path.join(galleryDir, 'offer.json');

  if (!fs.existsSync(offerPath)) {
    return defaultClientGalleryOffer;
  }

  try {
    const offer = JSON.parse(fs.readFileSync(offerPath, 'utf8'));

    if (!offer || typeof offer !== 'object' || Array.isArray(offer)) {
      return defaultClientGalleryOffer;
    }

    const freeImagesKey = getFirstDefinedValue(offer, [
      'freeImages',
      'freeImageCount',
      'freeItems',
      'freeItemCount',
      'free_images',
      'free_items',
      'free images',
      'Free images',
    ]);
    const pricePerImageKey = getFirstDefinedValue(offer, [
      'pricePerImage',
      'additionalImagePrice',
      'price_per_image',
      'additional_image_price',
      'price',
      'Price per image',
    ]);
    const priceForAllImagesKey = getFirstDefinedValue(offer, [
      'priceForAllImages',
      'allImagesPrice',
      'fullGalleryPrice',
      'price_for_all_images',
      'all_images_price',
      'full_gallery_price',
      'Price for all images',
    ]);
    const offerText =
      typeof offer.offerText === 'string' && offer.offerText.trim()
        ? offer.offerText.trim()
        : typeof offer.offer === 'string' && offer.offer.trim()
          ? offer.offer.trim()
          : defaultClientGalleryOffer.offerText;

    return {
      freeImages: Math.floor(
        normalizeNonNegativeNumber(
          freeImagesKey ? offer[freeImagesKey] : undefined,
          defaultClientGalleryOffer.freeImages,
        ),
      ),
      offerText,
      pricePerImage: normalizeNonNegativeNumber(
        pricePerImageKey ? offer[pricePerImageKey] : undefined,
        defaultClientGalleryOffer.pricePerImage,
      ),
      priceForAllImages: normalizeOptionalNonNegativeNumber(
        priceForAllImagesKey ? offer[priceForAllImagesKey] : undefined,
      ),
    };
  } catch (error) {
    console.warn(`Could not read ${offerPath}: ${error.message}`);

    return defaultClientGalleryOffer;
  }
}

function findPosterForVideo(videoFile, allFiles, publicPath) {
  const videoName = path.basename(videoFile, path.extname(videoFile));
  const poster = findPosterFilenameForVideo(videoFile, allFiles);

  return poster ? `${publicPath}/${poster}` : undefined;
}

function findPosterFilenameForVideo(videoFile, allFiles) {
  const videoName = path.basename(videoFile, path.extname(videoFile));

  return allFiles.find((file) => {
    const extension = path.extname(file).toLowerCase();
    const basename = path.basename(file, extension).toLowerCase();

    return imageExtensions.has(extension) && basename === `${videoName.toLowerCase()}-poster`;
  });
}

function getPublicDir(config) {
  const publicDir = config.publicDir || 'public';

  if (path.isAbsolute(publicDir)) {
    return publicDir;
  }

  return path.resolve(config.root, publicDir);
}

function getFilesInPublicMediaFolder(config, folderName) {
  const publicDir = getPublicDir(config);
  const mediaDir = path.join(publicDir, 'media', folderName);

  if (!fs.existsSync(mediaDir)) {
    return [];
  }

  return sortFiles(
    fs
      .readdirSync(mediaDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((filename) => !filename.startsWith('.') && isMediaFile(filename)),
  );
}

function getHeroSlides(config) {
  const files = getFilesInPublicMediaFolder(config, 'hero');

  const slides = files
    .filter((filename) => !isPosterFile(filename))
    .map((filename) => {
      const extension = path.extname(filename).toLowerCase();
      const type = videoExtensions.has(extension) ? 'video' : 'image';
      const label = toTitle(filename) || 'Hero slide';
      const slide = {
        id: path.basename(filename, extension),
        type,
        label,
        alt: `${label} by The Pepperazzi`,
        src: `/media/hero/${filename}`,
        fallback:
          'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=2200&q=85',
      };

      if (type === 'video') {
        slide.poster = findPosterForVideo(filename, files, '/media/hero');
        slide.duration = 10000;
        slide.mimeType = videoMimeTypes[extension];
      }

      return slide;
    });

  return slides.length > 0 ? slides : fallbackHeroSlides;
}

function getPortfolioCategory(filename) {
  const basename = path.basename(filename, path.extname(filename));
  const [prefix] = basename.split('-');

  return prefix.trim().toLowerCase() || 'other';
}

function readJpegDimensions(buffer) {
  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      ![0xc4, 0xc8, 0xcc].includes(marker)
    ) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += 2 + length;
  }

  return undefined;
}

function readWebpDimensions(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return undefined;
  }

  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunkType === 'VP8X' && dataOffset + 10 <= buffer.length) {
      return {
        width:
          1 +
          buffer[dataOffset + 4] +
          (buffer[dataOffset + 5] << 8) +
          (buffer[dataOffset + 6] << 16),
        height:
          1 +
          buffer[dataOffset + 7] +
          (buffer[dataOffset + 8] << 8) +
          (buffer[dataOffset + 9] << 16),
      };
    }

    if (chunkType === 'VP8L' && dataOffset + 5 <= buffer.length) {
      const bits = buffer.readUInt32LE(dataOffset + 1);

      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    if (chunkType === 'VP8 ' && dataOffset + 10 <= buffer.length) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return undefined;
}

function readAvifDimensions(buffer, start = 0, end = buffer.length) {
  let offset = start;

  while (offset + 8 <= end) {
    let boxSize = buffer.readUInt32BE(offset);
    const boxType = buffer.toString('ascii', offset + 4, offset + 8);
    let headerSize = 8;

    if (boxSize === 1 && offset + 16 <= end) {
      const largeSize = buffer.readBigUInt64BE(offset + 8);

      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) {
        return undefined;
      }

      boxSize = Number(largeSize);
      headerSize = 16;
    }

    if (boxSize < headerSize || offset + boxSize > end) {
      break;
    }

    const dataOffset = offset + headerSize;

    if (boxType === 'ispe' && dataOffset + 12 <= offset + boxSize) {
      return {
        width: buffer.readUInt32BE(dataOffset + 4),
        height: buffer.readUInt32BE(dataOffset + 8),
      };
    }

    const childStart = boxType === 'meta' ? dataOffset + 4 : dataOffset;
    const dimensions = readAvifDimensions(buffer, childStart, offset + boxSize);

    if (dimensions) {
      return dimensions;
    }

    offset += boxSize;
  }

  return undefined;
}

function readImageDimensions(filePath, extension) {
  try {
    const buffer = fs.readFileSync(filePath);

    if (extension === '.png' && buffer.length >= 24) {
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    }

    if (extension === '.gif' && buffer.length >= 10) {
      return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
      };
    }

    if (extension === '.jpg' || extension === '.jpeg') {
      return readJpegDimensions(buffer);
    }

    if (extension === '.webp') {
      return readWebpDimensions(buffer);
    }

    if (extension === '.avif') {
      return readAvifDimensions(buffer);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function toHeightRatio(dimensions, fallback = 1) {
  if (!dimensions?.width || !dimensions?.height) {
    return fallback;
  }

  return dimensions.height / dimensions.width;
}

function getPortfolioItems(config) {
  const files = getFilesInPublicMediaFolder(config, 'portfolio');
  const publicDir = getPublicDir(config);
  const mediaDir = path.join(publicDir, 'media', 'portfolio');

  const items = files
    .filter((filename) => !isPosterFile(filename))
    .map((filename) => {
      const extension = path.extname(filename).toLowerCase();
      const type = videoExtensions.has(extension) ? 'video' : 'image';
      const id = path.basename(filename, extension);
      const label = toTitle(filename) || 'Portfolio item';
      const posterFilename =
        type === 'video' ? findPosterFilenameForVideo(filename, files) : undefined;
      const dimensions =
        type === 'image'
          ? readImageDimensions(path.join(mediaDir, filename), extension)
          : posterFilename
            ? readImageDimensions(
                path.join(mediaDir, posterFilename),
                path.extname(posterFilename).toLowerCase(),
              )
            : undefined;
      const item = {
        id,
        type,
        category: getPortfolioCategory(filename),
        heightRatio: toHeightRatio(dimensions, type === 'video' ? 9 / 16 : 1),
        label,
        alt: `${label} by The Pepperazzi`,
        src: `/media/portfolio/${filename}`,
        transitionName: `portfolio-${toSafeIdent(id)}`,
      };

      if (type === 'video') {
        item.poster = posterFilename ? `/media/portfolio/${posterFilename}` : undefined;
        item.mimeType = videoMimeTypes[extension];
      }

      return item;
    });

  return items.length > 0 ? items : fallbackPortfolioItems;
}

function getClientGalleries(config) {
  const publicDir = getPublicDir(config);
  const galleriesDir = path.join(publicDir, 'media', 'client_galleries');

  if (!fs.existsSync(galleriesDir)) {
    return {};
  }

  return fs
    .readdirSync(galleriesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .reduce((galleries, entry) => {
      const galleryDir = path.join(galleriesDir, entry.name);
      const files = sortFiles(
        fs
          .readdirSync(galleryDir, { withFileTypes: true })
          .filter((fileEntry) => fileEntry.isFile())
          .map((fileEntry) => fileEntry.name)
          .filter((filename) => !filename.startsWith('.') && isImageFile(filename)),
      );

      galleries[entry.name] = {
        code: entry.name,
        offer: getClientGalleryOffer(galleryDir),
        images: files.map((filename) => {
          const id = path.basename(filename, path.extname(filename));
          const label = toTitle(filename) || 'Client gallery image';

          return {
            id,
            filename,
            label,
            alt: `${label} by The Pepperazzi`,
            src: `/media/client_galleries/${entry.name}/${filename}`,
          };
        }),
      };

      return galleries;
    }, {});
}

function mediaManifestPlugin() {
  let config;

  return {
    name: 'media-manifest',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      const publicDir = getPublicDir(server.config);
      const watchedMediaFolders = [
        {
          folderPath: path.join(publicDir, 'media', 'hero'),
          moduleId: resolvedHeroMediaModuleId,
        },
        {
          folderPath: path.join(publicDir, 'media', 'portfolio'),
          moduleId: resolvedPortfolioMediaModuleId,
        },
        {
          folderPath: path.join(publicDir, 'media', 'client_galleries'),
          moduleId: resolvedClientGalleriesModuleId,
        },
      ];

      watchedMediaFolders.forEach(({ folderPath }) => {
        fs.mkdirSync(folderPath, { recursive: true });
        server.watcher.add(folderPath);
      });

      const isRelevantMediaChange = ({ folderPath }, filePath, eventType) => {
        const filename = path.basename(filePath);
        const isDirectoryEvent = eventType === 'addDir' || eventType === 'unlinkDir';
        const isClientGalleryChange = folderPath.endsWith(
          `${path.sep}client_galleries`,
        );

        if (filename.startsWith('.')) {
          return false;
        }

        if (isDirectoryEvent) {
          return isClientGalleryChange;
        }

        if (isClientGalleryChange && filename === 'offer.json') {
          return true;
        }

        if (isClientGalleryChange) {
          return isImageFile(filename);
        }

        return isMediaFile(filename);
      };

      const refreshMedia = (filePath, eventType) => {
        const mediaFolder = watchedMediaFolders.find(({ folderPath }) => {
          const relativePath = path.relative(folderPath, filePath);

          return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
        });

        if (!mediaFolder) {
          return;
        }

        if (!isRelevantMediaChange(mediaFolder, filePath, eventType)) {
          return;
        }

        const module = server.moduleGraph.getModuleById(mediaFolder.moduleId);

        if (module) {
          server.moduleGraph.invalidateModule(module);
        }

        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('add', (filePath) => refreshMedia(filePath, 'add'));
      server.watcher.on('addDir', (filePath) => refreshMedia(filePath, 'addDir'));
      server.watcher.on('unlink', (filePath) => refreshMedia(filePath, 'unlink'));
      server.watcher.on('unlinkDir', (filePath) => refreshMedia(filePath, 'unlinkDir'));
      server.watcher.on('change', (filePath) => refreshMedia(filePath, 'change'));
    },
    resolveId(id) {
      if (id === heroMediaModuleId) {
        return resolvedHeroMediaModuleId;
      }

      if (id === portfolioMediaModuleId) {
        return resolvedPortfolioMediaModuleId;
      }

      if (id === clientGalleriesModuleId) {
        return resolvedClientGalleriesModuleId;
      }

      return undefined;
    },
    load(id) {
      if (id === resolvedHeroMediaModuleId) {
        return `export default ${JSON.stringify(getHeroSlides(config), null, 2)};`;
      }

      if (id === resolvedPortfolioMediaModuleId) {
        return `export default ${JSON.stringify(getPortfolioItems(config), null, 2)};`;
      }

      if (id === resolvedClientGalleriesModuleId) {
        return `export default ${JSON.stringify(getClientGalleries(config), null, 2)};`;
      }

      return undefined;
    },
  };
}

export default defineConfig({
  plugins: [react(), mediaManifestPlugin()],
  server: {
    watch: {
      ignored: [
        '**/.DS_Store',
        '**/._*',
        '**/.dropbox',
        '**/.dropbox.attr',
      ],
    },
  },
});
