import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Images,
  Instagram,
  Mail,
  MapPin,
  Pause,
  Play,
  X,
} from 'lucide-react';
import clientGalleries from 'virtual:client-galleries';
import heroSlides from 'virtual:hero-media';
import portfolioItems from 'virtual:portfolio-media';

const heroMessages = [
  'We capture your best Memories.',
  'We capture your best times.',
  'We capture your best friends.',
];

const services = [
  {
    title: 'Weddings & Events',
    text: 'Elegant photography and film coverage for vows, speeches, celebrations, dance floors, and the quiet moments between it all.',
    price: '£500',
    cta: 'Enquire about weddings',
    subject: 'Wedding and event photography enquiry',
  },
  {
    title: 'Newborns & Family',
    text: 'Relaxed portrait sessions for new arrivals, growing families, yearly updates, birthdays, and milestone memories at home or outdoors.',
    price: '£150',
    cta: 'Book a family session',
    subject: 'Family portrait session enquiry',
  },
  {
    title: 'Pets',
    text: 'Patient, personality-led portraits for pets and their people, with space for movement, play, and all the little quirks.',
    price: '£150',
    cta: 'Book a pet session',
    subject: 'Pet portrait session enquiry',
  },
  {
    title: 'More Stories',
    text: 'Brand shoots, events, anniversaries, proposals, and short-form video packages for people with something to remember.',
    price: 'Custom',
    cta: 'Plan a project',
    subject: 'Custom photography and video enquiry',
  },
];

const includedClientImageCount = 3;
const additionalClientImagePrice = 10;
const contactEmail = 'trpepper@me.com';
const clientGallerySessionKey = 'pepperazzi-client-gallery';
const socialLinks = [
  {
    href: 'https://www.instagram.com/the_pepper_azzi/',
    icon: Instagram,
    label: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/share/18sc5rvhMD/?mibextid=wwXIfr',
    icon: Facebook,
    label: 'Facebook',
  },
];

function sanitizeClientCode(value) {
  return value.replace(/\s+/g, '');
}

function getSavedClientGalleryState() {
  const fallbackState = {
    activeCode: '',
    code: '',
    hasSearched: false,
    isOpen: false,
  };

  if (typeof window === 'undefined') {
    return fallbackState;
  }

  try {
    const savedState = window.sessionStorage.getItem(clientGallerySessionKey);

    if (!savedState) {
      return fallbackState;
    }

    const parsedState = JSON.parse(savedState);
    const code = sanitizeClientCode(String(parsedState.code ?? ''));
    const activeCode = sanitizeClientCode(String(parsedState.activeCode ?? code));

    return {
      activeCode,
      code,
      hasSearched: Boolean(parsedState.hasSearched && activeCode),
      isOpen: Boolean(parsedState.isOpen),
    };
  } catch {
    return fallbackState;
  }
}

function formatPounds(value) {
  return `£${value}`;
}

function shuffleItems(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function getPortfolioColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => []);
  const columnHeights = Array.from({ length: columnCount }, () => 0);

  items.forEach((item, index) => {
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

    columns[shortestColumnIndex].push({ item, index });
    columnHeights[shortestColumnIndex] += item.heightRatio || 1;
  });

  return columns;
}

function getPortfolioFilters(items) {
  const categoryCounts = items.reduce((counts, item) => {
    const currentCount = counts.get(item.category) ?? 0;

    counts.set(item.category, currentCount + 1);

    return counts;
  }, new Map());
  const categories = Array.from(categoryCounts.entries()).sort(
    ([firstCategory, firstCount], [secondCategory, secondCount]) => {
      if (firstCount !== secondCount) {
        return secondCount - firstCount;
      }

      return firstCategory.localeCompare(secondCategory);
    }
  );

  return [
    { id: 'all', label: 'all' },
    ...categories.map(([category]) => ({ id: category, label: category })),
  ];
}

function getRandomPortfolioImage(items) {
  const landscapeImageItems = items.filter(
    (item) => item.type === 'image' && item.heightRatio < 1,
  );
  const imageItems = landscapeImageItems.length
    ? landscapeImageItems
    : items.filter((item) => item.type === 'image');

  if (imageItems.length === 0) {
    return undefined;
  }

  return imageItems[Math.floor(Math.random() * imageItems.length)];
}

function PortfolioMasonryItem({ canOpen, index, item, onOpen }) {
  const itemRef = useRef(null);
  const mediaRef = useRef(null);
  const [shouldLoadMedia, setShouldLoadMedia] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const itemNode = itemRef.current;

    if (!itemNode) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoadMedia(true);
      setIsInView(true);
      return undefined;
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setShouldLoadMedia(true);
        loadObserver.unobserve(entry.target);
      },
      {
        rootMargin: '240px 0px',
        threshold: 0.01,
      },
    );

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsInView(true);
        revealObserver.unobserve(entry.target);
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      },
    );

    loadObserver.observe(itemNode);
    revealObserver.observe(itemNode);

    return () => {
      loadObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (item.type !== 'image') {
      return;
    }

    const image = mediaRef.current;

    if (image?.complete) {
      setHasLoaded(true);
    }
  }, [item.type, item.src]);

  useEffect(() => {
    if (item.type !== 'video' || !shouldLoadMedia) {
      return;
    }

    const video = mediaRef.current;

    if (!video) {
      return;
    }

    video.load();
  }, [shouldLoadMedia, item.type, item.src]);

  useEffect(() => {
    if (item.type !== 'video' || !isInView || !hasLoaded) {
      return;
    }

    const video = mediaRef.current;

    if (!video) {
      return;
    }

    const playPromise = video.play();

    if (playPromise) {
      playPromise.catch(() => {});
    }
  }, [hasLoaded, isInView, item.type]);

  const markLoaded = () => setHasLoaded(true);
  const openItem = () => {
    if (canOpen) {
      onOpen(item);
    }
  };
  const openItemWithKeyboard = (event) => {
    if (!canOpen || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    onOpen(item);
  };
  const itemClassName = `portfolio-masonry__item${
    hasLoaded && isInView ? ' is-loaded' : ''
  }`;

  return (
    <article
      className={itemClassName}
      key={item.id}
      ref={itemRef}
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : undefined}
      style={{
        '--reveal-delay': `${(index % 6) * 45}ms`,
        viewTransitionName: item.transitionName,
      }}
      onClick={openItem}
      onKeyDown={openItemWithKeyboard}
    >
      {item.type === 'video' ? (
        <video
          ref={mediaRef}
          autoPlay={isInView}
          muted
          loop
          playsInline
          preload={shouldLoadMedia ? 'metadata' : 'none'}
          poster={item.poster}
          aria-label={item.alt}
          onLoadedData={markLoaded}
          onError={markLoaded}
        >
          {shouldLoadMedia && (
            <source src={item.src} type={item.mimeType || 'video/mp4'} />
          )}
        </video>
      ) : (
        <img
          ref={mediaRef}
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          onLoad={markLoaded}
          onError={markLoaded}
        />
      )}
    </article>
  );
}

function clampPercentage(value) {
  return Math.min(Math.max(value, 0), 100);
}

function clampValue(value, minimum, maximum) {
  if (maximum < minimum) {
    return (minimum + maximum) / 2;
  }

  return Math.min(Math.max(value, minimum), maximum);
}

function preventClientImageContextMenu(event) {
  event.preventDefault();
}

function ClientGalleryProtectedImage({ image }) {
  const [lens, setLens] = useState({ isActive: false, x: 50, y: 50 });

  const updateLens = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    if (!bounds.width || !bounds.height) {
      return;
    }

    if (event.pointerType !== 'mouse' && event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is helpful, but not required for the lens to work.
      }
    }

    const lensRadius = Math.min(
      74,
      Math.max(42, (typeof window === 'undefined' ? 0 : window.innerWidth) * 0.06),
      bounds.width / 2,
      bounds.height / 2,
    );
    const touchOffset = Math.min(132, Math.max(86, bounds.height * 0.28));
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    const lensX = clampValue(pointerX, lensRadius, bounds.width - lensRadius);
    const lensY =
      event.pointerType === 'mouse'
        ? clampValue(pointerY, lensRadius, bounds.height - lensRadius)
        : clampValue(pointerY - touchOffset, lensRadius, bounds.height - lensRadius);

    setLens({
      isActive: true,
      x: clampPercentage((lensX / bounds.width) * 100),
      y: clampPercentage((lensY / bounds.height) * 100),
    });
  };

  const hideLens = () => {
    setLens((currentLens) => ({ ...currentLens, isActive: false }));
  };

  const hideTouchLens = (event) => {
    if (event.pointerType !== 'mouse') {
      hideLens();
    }
  };

  return (
    <div
      className={`client-gallery-card__media${lens.isActive ? ' is-revealing' : ''}`}
      style={{
        '--lens-x': `${lens.x}%`,
        '--lens-y': `${lens.y}%`,
      }}
      onPointerCancel={hideLens}
      onPointerDown={updateLens}
      onPointerEnter={updateLens}
      onPointerLeave={hideLens}
      onPointerMove={updateLens}
      onPointerUp={hideTouchLens}
      onContextMenu={preventClientImageContextMenu}
    >
      <img
        className="client-gallery-card__image client-gallery-card__image--blurred"
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        draggable="false"
        onContextMenu={preventClientImageContextMenu}
        onDragStart={preventClientImageContextMenu}
      />
      {lens.isActive && (
        <>
          <img
            className="client-gallery-card__image client-gallery-card__image--lens"
            src={image.src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            aria-hidden="true"
            onContextMenu={preventClientImageContextMenu}
            onDragStart={preventClientImageContextMenu}
          />
          <span className="client-gallery-card__lens-ring" aria-hidden="true" />
        </>
      )}
    </div>
  );
}

function ClientGalleryPanel({
  activeCode,
  codeInput,
  gallery,
  hasSearched,
  onClose,
  onCodeChange,
  onRequestImages,
  onSearch,
  onToggleImage,
  selectedImageIds,
}) {
  const images = gallery?.images ?? [];
  const selectedCount = selectedImageIds.size;
  const paidImageCount = Math.max(selectedCount - includedClientImageCount, 0);
  const totalCost = paidImageCount * additionalClientImagePrice;

  return (
    <section className="client-gallery-panel" aria-label="Client photo gallery">
      <header className="client-gallery-panel__header">
        <div>
          <p className="eyebrow">Client gallery</p>
          <h2>Get my photos</h2>
        </div>
        <button
          className="client-gallery-panel__close"
          type="button"
          aria-label="Close client gallery"
          onClick={onClose}
        >
          <X size={24} aria-hidden="true" />
        </button>
      </header>

      <form className="client-gallery-panel__lookup" onSubmit={onSearch}>
        <label htmlFor="client-gallery-code">Gallery code</label>
        <div className="client-gallery-panel__lookup-row">
          <input
            id="client-gallery-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="07964907393"
            value={codeInput}
            onChange={(event) => onCodeChange(event.target.value)}
          />
          <button className="button button--primary" type="submit">
            <Images size={17} aria-hidden="true" />
            Open
          </button>
        </div>
      </form>

      {hasSearched && !gallery && (
        <p className="client-gallery-panel__message">
          No gallery found for {activeCode}. Check the code and try again.
        </p>
      )}

      {gallery && (
        <>
          <div className="client-gallery-notice">
            <p>
              Three full resolution images are included in your package. Select which
              three you would like and we will send them to your email address. If
              you wish to purchase more than the 3 included images, each additional
              image is £10 and we will send a payment link for you to complete the
              purchase.
            </p>
          </div>

          {images.length > 0 ? (
            <div className="client-gallery-grid" aria-label={`Photos for ${activeCode}`}>
              {images.map((image) => {
                const isSelected = selectedImageIds.has(image.id);

                return (
                  <article
                    className={`client-gallery-card${isSelected ? ' is-selected' : ''}`}
                    key={image.id}
                  >
                    <ClientGalleryProtectedImage image={image} />
                    <button
                      className="client-gallery-card__select"
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onToggleImage(image.id)}
                    >
                      {isSelected && <Check size={16} aria-hidden="true" />}
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="client-gallery-panel__message">
              This gallery exists, but it does not have any images in it yet.
            </p>
          )}

          <div className="client-gallery-summary" aria-live="polite">
            <div>
              <span>Selected</span>
              <strong>{selectedCount}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatPounds(totalCost)}</strong>
            </div>
            <button
              className="client-gallery-summary__request"
              type="button"
              disabled={selectedCount === 0}
              onClick={onRequestImages}
            >
              <Mail size={17} aria-hidden="true" />
              Request Images
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function App() {
  const [initialClientGalleryState] = useState(getSavedClientGalleryState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeMessage, setActiveMessage] = useState(0);
  const [activePortfolioFilter, setActivePortfolioFilter] = useState('all');
  const [activePortfolioItem, setActivePortfolioItem] = useState(null);
  const [canOpenPortfolioLightbox, setCanOpenPortfolioLightbox] = useState(false);
  const [isClientGalleryOpen, setIsClientGalleryOpen] = useState(
    initialClientGalleryState.isOpen,
  );
  const [clientGalleryCodeInput, setClientGalleryCodeInput] = useState(
    initialClientGalleryState.code,
  );
  const [activeClientGalleryCode, setActiveClientGalleryCode] = useState(
    initialClientGalleryState.activeCode,
  );
  const [hasSearchedClientGallery, setHasSearchedClientGallery] = useState(
    initialClientGalleryState.hasSearched,
  );
  const [selectedClientImageIds, setSelectedClientImageIds] = useState(
    () => new Set(),
  );
  const [portfolioColumnCount, setPortfolioColumnCount] = useState(() => {
    if (typeof window === 'undefined') {
      return 3;
    }

    return window.matchMedia('(max-width: 920px)').matches ? 2 : 3;
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [failedSlides, setFailedSlides] = useState({});

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 920px)');

    const updateColumnCount = () => {
      setPortfolioColumnCount(mediaQuery.matches ? 2 : 3);
    };

    updateColumnCount();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateColumnCount);
    } else {
      mediaQuery.addListener(updateColumnCount);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateColumnCount);
      } else {
        mediaQuery.removeListener(updateColumnCount);
      }
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 620px)');

    const updateLightboxMode = () => {
      setCanOpenPortfolioLightbox(mediaQuery.matches);

      if (!mediaQuery.matches) {
        setActivePortfolioItem(null);
      }
    };

    updateLightboxMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateLightboxMode);
    } else {
      mediaQuery.addListener(updateLightboxMode);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateLightboxMode);
      } else {
        mediaQuery.removeListener(updateLightboxMode);
      }
    };
  }, []);

  useEffect(() => {
    if (!activePortfolioItem && !isClientGalleryOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setActivePortfolioItem(null);
        setIsClientGalleryOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activePortfolioItem, isClientGalleryOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!isClientGalleryOpen) {
      window.sessionStorage.removeItem(clientGallerySessionKey);
      return undefined;
    }

    window.sessionStorage.setItem(
      clientGallerySessionKey,
      JSON.stringify({
        activeCode: activeClientGalleryCode,
        code: clientGalleryCodeInput,
        hasSearched: hasSearchedClientGallery,
        isOpen: true,
      }),
    );

    return undefined;
  }, [
    activeClientGalleryCode,
    clientGalleryCodeInput,
    hasSearchedClientGallery,
    isClientGalleryOpen,
  ]);

  useEffect(() => {
    setActiveSlide((currentSlide) =>
      Math.min(currentSlide, Math.max(heroSlides.length - 1, 0)),
    );
  }, [heroSlides.length]);

  useEffect(() => {
    if (!isPlaying || heroSlides.length < 2) {
      return undefined;
    }

    const delay = heroSlides[activeSlide]?.duration ?? 6500;
    const timer = window.setTimeout(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeSlide, isPlaying]);

  useEffect(() => {
    if (heroMessages.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveMessage((currentMessage) => (currentMessage + 1) % heroMessages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  const markSlideFailed = (slideId) => {
    setFailedSlides((failed) => {
      if (failed[slideId]) {
        return failed;
      }

      return { ...failed, [slideId]: true };
    });
  };

  const showSlide = (slideIndex) => {
    if (heroSlides.length === 0) {
      return;
    }

    setActiveSlide((slideIndex + heroSlides.length) % heroSlides.length);
  };

  const goToPreviousSlide = () => {
    showSlide(activeSlide - 1);
  };

  const goToNextSlide = () => {
    showSlide(activeSlide + 1);
  };

  const shuffledPortfolioItems = useMemo(
    () => shuffleItems(portfolioItems),
    [portfolioItems],
  );
  const portfolioFilters = useMemo(
    () => getPortfolioFilters(portfolioItems),
    [portfolioItems],
  );
  const footerImage = useMemo(
    () => getRandomPortfolioImage(portfolioItems),
    [portfolioItems],
  );

  const visiblePortfolioItems =
    activePortfolioFilter === 'all'
      ? shuffledPortfolioItems
      : shuffledPortfolioItems.filter(
          (item) => item.category === activePortfolioFilter,
        );
  const portfolioColumns = useMemo(
    () => getPortfolioColumns(visiblePortfolioItems, portfolioColumnCount),
    [portfolioColumnCount, visiblePortfolioItems],
  );
  const activeClientGallery =
    activeClientGalleryCode && clientGalleries[activeClientGalleryCode]
      ? clientGalleries[activeClientGalleryCode]
      : null;
  const selectedClientImages = useMemo(() => {
    if (!activeClientGallery) {
      return [];
    }

    return activeClientGallery.images.filter((image) =>
      selectedClientImageIds.has(image.id),
    );
  }, [activeClientGallery, selectedClientImageIds]);

  useEffect(() => {
    const hasActiveFilter = portfolioFilters.some(
      (filter) => filter.id === activePortfolioFilter,
    );

    if (!hasActiveFilter) {
      setActivePortfolioFilter('all');
    }
  }, [activePortfolioFilter, portfolioFilters]);

  const selectPortfolioFilter = (filterId) => {
    if (filterId === activePortfolioFilter) {
      return;
    }

    const updateFilter = () => setActivePortfolioFilter(filterId);

    if (document.startViewTransition) {
      document.startViewTransition(updateFilter);
      return;
    }

    updateFilter();
  };

  const openPortfolioItem = (item) => {
    if (canOpenPortfolioLightbox) {
      setActivePortfolioItem(item);
    }
  };

  const closePortfolioLightbox = () => setActivePortfolioItem(null);

  const openClientGallery = () => setIsClientGalleryOpen(true);

  const closeClientGallery = () => setIsClientGalleryOpen(false);

  const updateClientGalleryCode = (value) => {
    setClientGalleryCodeInput(sanitizeClientCode(value));
  };

  const searchClientGallery = (event) => {
    event.preventDefault();

    const sanitizedCode = sanitizeClientCode(clientGalleryCodeInput);

    setClientGalleryCodeInput(sanitizedCode);
    setActiveClientGalleryCode(sanitizedCode);
    setHasSearchedClientGallery(true);
    setSelectedClientImageIds(new Set());
  };

  const toggleClientImage = (imageId) => {
    setSelectedClientImageIds((selectedIds) => {
      const nextSelectedIds = new Set(selectedIds);

      if (nextSelectedIds.has(imageId)) {
        nextSelectedIds.delete(imageId);
      } else {
        nextSelectedIds.add(imageId);
      }

      return nextSelectedIds;
    });
  };

  const requestClientImages = () => {
    if (!activeClientGallery || selectedClientImages.length === 0) {
      return;
    }

    const paidImageCount = Math.max(
      selectedClientImages.length - includedClientImageCount,
      0,
    );
    const totalCost = paidImageCount * additionalClientImagePrice;
    const selectedList = selectedClientImages
      .map((image) => `- ${image.filename}`)
      .join('\n');
    const subject = `Client image request ${activeClientGalleryCode}`;
    const body = [
      `Client gallery code: ${activeClientGalleryCode}`,
      `Selected images: ${selectedClientImages.length}`,
      `Included images: ${Math.min(
        selectedClientImages.length,
        includedClientImageCount,
      )}`,
      `Additional paid images: ${paidImageCount}`,
      `Amount due: ${formatPounds(totalCost)}`,
      '',
      'Requested images:',
      selectedList,
    ].join('\n');

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="Main navigation">
        <nav className="topbar__nav topbar__nav--left" aria-label="Primary">
          <a href="#home">Home</a>
        </nav>

        <a className="brand" href="#home" aria-label="The Pepperazzi home">
          <img src="/brand/the-pepperazzi-logo.svg" alt="The Pepperazzi" />
        </a>

        <nav className="topbar__nav topbar__nav--right" aria-label="Contact">
          <button
            className="topbar__client-trigger"
            type="button"
            onClick={openClientGallery}
          >
            <Images size={15} aria-hidden="true" />
            Get my photos
          </button>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="topbar__client-trigger topbar__client-trigger--mobile"
          type="button"
          onClick={openClientGallery}
        >
          <Images size={15} aria-hidden="true" />
          Get my photos
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero__media" aria-hidden="true">
          {heroSlides.map((slide, index) => {
            const hasFailed = failedSlides[slide.id];
            const slideClassName = `hero__slide${
              index === activeSlide ? ' is-active' : ''
            }`;

            if (slide.type === 'video' && !hasFailed) {
              return (
                <div className={slideClassName} key={slide.id}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={slide.poster}
                    onError={() => markSlideFailed(slide.id)}
                  >
                    <source
                      src={slide.src}
                      type={slide.mimeType || 'video/mp4'}
                      onError={() => markSlideFailed(slide.id)}
                    />
                  </video>
                </div>
              );
            }

            return (
              <div className={slideClassName} key={slide.id}>
                <img
                  src={hasFailed ? slide.fallback : slide.src}
                  alt={slide.alt}
                  onError={() => markSlideFailed(slide.id)}
                />
              </div>
            );
          })}
        </div>
        <div className="hero__content">
          <h1 className="hero__headline" aria-live="off">
            <span key={heroMessages[activeMessage]}>{heroMessages[activeMessage]}</span>
          </h1>
        </div>
        {heroSlides.length > 1 && (
          <div className="hero__controls" aria-label="Hero carousel controls">
            <button
              className="hero__arrow"
              type="button"
              aria-label="Previous hero slide"
              onClick={goToPreviousSlide}
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>

            <div className="hero__dots" role="tablist" aria-label="Hero slides">
              {heroSlides.map((slide, index) => (
                <button
                  className={`hero__dot${index === activeSlide ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-label={`Show ${slide.label}`}
                  aria-selected={index === activeSlide}
                  key={slide.id}
                  onClick={() => showSlide(index)}
                />
              ))}
              <button
                className="hero__toggle"
                type="button"
                aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                onClick={() => setIsPlaying((playing) => !playing)}
              >
                {isPlaying ? (
                  <Pause size={14} aria-hidden="true" />
                ) : (
                  <Play size={14} aria-hidden="true" />
                )}
              </button>
            </div>

            <button
              className="hero__arrow"
              type="button"
              aria-label="Next hero slide"
              onClick={goToNextSlide}
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section className="portfolio section-pad" id="portfolio">
        <div className="portfolio__header">
          <h2>Our Photos and Videos from over the years</h2>
        </div>

        <div className="portfolio__filters" aria-label="Filter portfolio">
          {portfolioFilters.map((filter) => (
            <button
              className={`portfolio__filter${
                activePortfolioFilter === filter.id ? ' is-active' : ''
              }`}
              type="button"
              aria-pressed={activePortfolioFilter === filter.id}
              key={filter.id}
              onClick={() => selectPortfolioFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="portfolio-masonry">
          {portfolioColumns.map((column, columnIndex) => (
            <div className="portfolio-masonry__column" key={columnIndex}>
              {column.map(({ item, index }) => (
                <PortfolioMasonryItem
                  canOpen={canOpenPortfolioLightbox}
                  index={index}
                  item={item}
                  key={item.id}
                  onOpen={openPortfolioItem}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="services section-pad" id="packages">
        <div className="section-heading section-heading--center">
          <h2>Packages</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <div className="service-card__pricing">
                <span>Starting from</span>
                <strong>{service.price}</strong>
              </div>
              <a
                className="service-card__cta"
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(
                  service.subject,
                )}`}
              >
                {service.cta}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div
          className="contact__image"
          style={
            footerImage
              ? { '--contact-image': `url("${footerImage.src}")` }
              : undefined
          }
          aria-hidden="true"
        />
        <div className="contact__content">
          <p className="eyebrow">Bookings & availability</p>
          <h2>Tell me what you are planning.</h2>
          <p>
            Share your date, location, and the kind of coverage you have in mind.
            I will come back with availability, package guidance, and next steps.
          </p>
          <div className="contact-list" aria-label="Contact details">
            <a href={`mailto:${contactEmail}`}>
              <Mail size={19} aria-hidden="true" />
              {contactEmail}
            </a>
            <a href={`mailto:${contactEmail}?subject=Photography%20and%20videography%20availability`}>
              <CalendarDays size={19} aria-hidden="true" />
              Check availability
            </a>
            <span>
              <MapPin size={19} aria-hidden="true" />
              Available for local and destination shoots
            </span>
            <div className="contact-list__socials" aria-label="Social links">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a href={href} target="_blank" rel="noreferrer" key={label}>
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>The Pepperazzi</p>
        <div className="footer__actions">
          <div className="footer__socials" aria-label="Social links">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                className="footer__social"
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                key={label}
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
          <a
            className="footer__contact"
            href={`mailto:${contactEmail}?subject=Photography%20and%20videography%20enquiry`}
          >
            <Mail size={17} aria-hidden="true" />
            Get in touch
          </a>
        </div>
      </footer>

      {isClientGalleryOpen && (
        <ClientGalleryPanel
          activeCode={activeClientGalleryCode}
          codeInput={clientGalleryCodeInput}
          gallery={activeClientGallery}
          hasSearched={hasSearchedClientGallery}
          onClose={closeClientGallery}
          onCodeChange={updateClientGalleryCode}
          onRequestImages={requestClientImages}
          onSearch={searchClientGallery}
          onToggleImage={toggleClientImage}
          selectedImageIds={selectedClientImageIds}
        />
      )}

      {activePortfolioItem && canOpenPortfolioLightbox && (
        <div
          className="portfolio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activePortfolioItem.label}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePortfolioLightbox();
            }
          }}
        >
          <button
            className="portfolio-lightbox__close"
            type="button"
            aria-label="Close portfolio preview"
            onClick={closePortfolioLightbox}
          >
            <X size={26} aria-hidden="true" />
          </button>

          <div className="portfolio-lightbox__stage">
            {activePortfolioItem.type === 'video' ? (
              <video
                autoPlay
                controls
                muted
                loop
                playsInline
                poster={activePortfolioItem.poster}
              >
                <source
                  src={activePortfolioItem.src}
                  type={activePortfolioItem.mimeType || 'video/mp4'}
                />
              </video>
            ) : (
              <img src={activePortfolioItem.src} alt={activePortfolioItem.alt} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
