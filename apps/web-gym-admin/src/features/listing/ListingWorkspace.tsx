'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Amenity, GymListingRecord, OperatingHours } from '@myclup/contracts/listing';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

const ALL_AMENITIES: Amenity[] = [
  'pool',
  'parking',
  'sauna',
  'personal_training',
  'group_classes',
  'locker_rooms',
  'showers',
  'cafe',
  'childcare',
  'wifi',
];

type DayKey = keyof OperatingHours;

const DAYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function buildDefaultHours(): OperatingHours {
  const day = { open: false, openTime: null, closeTime: null };
  return {
    monday: { ...day },
    tuesday: { ...day },
    wednesday: { ...day },
    thursday: { ...day },
    friday: { ...day },
    saturday: { ...day },
    sunday: { ...day },
  };
}

export function ListingWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');

  const [listing, setListing] = useState<GymListingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Address fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Amenities
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // Operating hours
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(buildDefaultHours());

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Visibility state
  const [isPublished, setIsPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [visibilitySuccess, setVisibilitySuccess] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const populateForm = useCallback((data: GymListingRecord) => {
    setName(data.name);
    setDescription(data.description ?? '');
    setAddressLine1(data.addressLine1 ?? '');
    setAddressLine2(data.addressLine2 ?? '');
    setCity(data.city ?? '');
    setCountry(data.country ?? '');
    setPhone(data.phone ?? '');
    setWebsite(data.website ?? '');
    setAmenities(data.amenities);
    setOperatingHours(data.operatingHours ?? buildDefaultHours());
    setIsPublished(data.isPublished);
  }, []);

  const loadListing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listing.get();
      setListing(data);
      populateForm(data);
    } catch {
      setError(t('gymAdminWeb.listing.errorBody'));
    } finally {
      setLoading(false);
    }
  }, [api, t, populateForm]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updated = await api.listing.update({
        name: name.trim(),
        description: description.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        amenities,
        operatingHours,
      });
      setListing(updated);
      setIsPublished(updated.isPublished);
      setSaveSuccess(true);
    } catch {
      setSaveError(t('gymAdminWeb.listing.saveError'));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    name,
    description,
    addressLine1,
    addressLine2,
    city,
    country,
    phone,
    website,
    amenities,
    operatingHours,
    t,
  ]);

  const handleSetVisibility = useCallback(
    async (publish: boolean) => {
      setPublishing(true);
      setVisibilitySuccess(false);
      setVisibilityError(null);
      try {
        const result = await api.listing.setVisibility(publish);
        setIsPublished(result.isPublished);
        setVisibilitySuccess(true);
      } catch {
        setVisibilityError(t('gymAdminWeb.listing.visibilityError'));
      } finally {
        setPublishing(false);
      }
    },
    [api, t]
  );

  function toggleAmenity(amenity: Amenity) {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }

  function setDayOpen(day: DayKey, open: boolean) {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        open,
        openTime: open ? prev[day].openTime : null,
        closeTime: open ? prev[day].closeTime : null,
      },
    }));
  }

  function setDayTime(day: DayKey, field: 'openTime' | 'closeTime', value: string) {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value || null },
    }));
  }

  function amenityLabel(amenity: Amenity): string {
    const map: Record<Amenity, string> = {
      pool: t('gymAdminWeb.listing.amenityPool'),
      parking: t('gymAdminWeb.listing.amenityParking'),
      sauna: t('gymAdminWeb.listing.amenitySauna'),
      personal_training: t('gymAdminWeb.listing.amenityPersonalTraining'),
      group_classes: t('gymAdminWeb.listing.amenityGroupClasses'),
      locker_rooms: t('gymAdminWeb.listing.amenityLockerRooms'),
      showers: t('gymAdminWeb.listing.amenityShowers'),
      cafe: t('gymAdminWeb.listing.amenityCafe'),
      childcare: t('gymAdminWeb.listing.amenityChildcare'),
      wifi: t('gymAdminWeb.listing.amenityWifi'),
    };
    return map[amenity];
  }

  function dayLabel(day: DayKey): string {
    const map: Record<DayKey, string> = {
      monday: t('gymAdminWeb.listing.dayMonday'),
      tuesday: t('gymAdminWeb.listing.dayTuesday'),
      wednesday: t('gymAdminWeb.listing.dayWednesday'),
      thursday: t('gymAdminWeb.listing.dayThursday'),
      friday: t('gymAdminWeb.listing.dayFriday'),
      saturday: t('gymAdminWeb.listing.daySaturday'),
      sunday: t('gymAdminWeb.listing.daySunday'),
    };
    return map[day];
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontWeight: 500,
    fontSize: '0.875rem',
  };

  const sectionStyle: React.CSSProperties = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 1rem',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1024, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {t('gymAdminWeb.listing.heroTitle')}
        </h1>
        <p style={{ color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
          {t('gymAdminWeb.listing.heroSubtitle')}
        </p>
      </div>

      {loading && <p style={{ color: '#64748b' }}>{t('gymAdminWeb.listing.loadingBody')}</p>}

      {!loading && error && (
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.listing.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}

      {!loading && !error && listing && (
        <>
          {/* Profile section */}
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>{t('gymAdminWeb.listing.sectionProfile')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldName')}
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldDescription')}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </label>
            </div>
          </div>

          {/* Address section */}
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>{t('gymAdminWeb.listing.sectionAddress')}</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldAddressLine1')}
                <input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldAddressLine2')}
                <input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldCity')}
                <input value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldCountry')}
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldPhone')}
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('gymAdminWeb.listing.fieldWebsite')}
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          {/* Amenities section */}
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>{t('gymAdminWeb.listing.sectionAmenities')}</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {ALL_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  {amenityLabel(amenity)}
                </label>
              ))}
            </div>
          </div>

          {/* Operating hours section */}
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>{t('gymAdminWeb.listing.sectionHours')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DAYS.map((day) => {
                const dayData = operatingHours[day];
                return (
                  <div
                    key={day}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        minWidth: 110,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={dayData.open}
                        onChange={(e) => setDayOpen(day, e.target.checked)}
                      />
                      {dayLabel(day)}
                    </label>
                    {dayData.open && (
                      <>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <span style={{ color: '#475569' }}>
                            {t('gymAdminWeb.listing.hoursOpenTime')}
                          </span>
                          <input
                            type="time"
                            value={dayData.openTime ?? ''}
                            onChange={(e) => setDayTime(day, 'openTime', e.target.value)}
                            style={{ ...inputStyle, width: 'auto' }}
                          />
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.8125rem',
                          }}
                        >
                          <span style={{ color: '#475569' }}>
                            {t('gymAdminWeb.listing.hoursCloseTime')}
                          </span>
                          <input
                            type="time"
                            value={dayData.closeTime ?? ''}
                            onChange={(e) => setDayTime(day, 'closeTime', e.target.value)}
                            style={{ ...inputStyle, width: 'auto' }}
                          />
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visibility section */}
          <div style={sectionStyle}>
            <h2 style={sectionHeadingStyle}>{t('gymAdminWeb.listing.sectionVisibility')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: isPublished ? '#dcfce7' : '#e2e8f0',
                  color: isPublished ? '#166534' : '#334155',
                  padding: '0.125rem 0.625rem',
                  borderRadius: 9999,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {isPublished
                  ? t('gymAdminWeb.listing.publishedBadge')
                  : t('gymAdminWeb.listing.unpublishedBadge')}
              </span>
              <button
                onClick={() => handleSetVisibility(!isPublished)}
                disabled={publishing}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.5rem 1rem',
                  cursor: publishing ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  opacity: publishing ? 0.6 : 1,
                }}
              >
                {publishing
                  ? t('gymAdminWeb.listing.publishing')
                  : isPublished
                    ? t('gymAdminWeb.listing.unpublishButton')
                    : t('gymAdminWeb.listing.publishButton')}
              </button>
              {visibilitySuccess && !visibilityError && (
                <span style={{ color: '#166534', fontSize: '0.875rem' }}>
                  {t('gymAdminWeb.listing.visibilitySuccess')}
                </span>
              )}
              {visibilityError && (
                <span style={{ color: '#991b1b', fontSize: '0.875rem' }}>{visibilityError}</span>
              )}
            </div>
          </div>

          {/* Save row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.5rem 1.25rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? t('gymAdminWeb.listing.saving') : t('gymAdminWeb.listing.saveButton')}
            </button>
            {saveSuccess && !saveError && (
              <span style={{ color: '#166534', fontSize: '0.875rem' }}>
                {t('gymAdminWeb.listing.saveSuccess')}
              </span>
            )}
            {saveError && (
              <span style={{ color: '#991b1b', fontSize: '0.875rem' }}>{saveError}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
