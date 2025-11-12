export type Language = 'pl' | 'de';

export const locales: Record<Language, string> = {
  pl: 'pl-PL',
  de: 'de-DE'
};

export const translations = {
  pl: {
    dropdown: {
      title: 'Opcje',
      filters: {
        nonPassenger: 'Relacje niepasażerskie',
        terminating: 'Relacje kończące bieg',
        soundsEnabled: 'Dźwięki'
      },
      language: {
        label: 'Język',
        options: {
          pl: 'Polski',
          de: 'Niemiecki'
        }
      },
      checkpointLabel: 'Posterunek:',
      alt: 'opcje'
    },
    home: {
      heading: 'Wybierz region i scenerię, aby otworzyć widok pragotronu',
      loading: 'Ładowanie listy aktywnych scenerii...',
      empty: 'Brak aktywnych scenerii'
    },
    pragotron: {
      headers: {
        time: 'GODZ.',
        train: 'POCIĄG',
        via: 'PRZEZ',
        destination: 'DO STACJI',
        delay: 'OPÓŹNIONY'
      },
      audioError: 'Dźwięk nie mógł zostać odtworzony:'
    }
  },
  de: {
    dropdown: {
      title: 'Optionen',
      filters: {
        nonPassenger: 'Nicht-Personenzüge',
        terminating: 'Endende Zugläufe',
        soundsEnabled: 'Geräusche'
      },
      language: {
        label: 'Sprache',
        options: {
          pl: 'Polnisch',
          de: 'Deutsch'
        }
      },
      checkpointLabel: 'Stellwerk:',
      alt: 'Optionen'
    },
    home: {
      heading: 'Wähle Region und Szenerie, um die Pragotron-Anzeige zu öffnen',
      loading: 'Aktive Szenerien werden geladen...',
      empty: 'Keine aktiven Szenerien'
    },
    pragotron: {
      headers: {
        time: 'UHRZEIT',
        train: 'ZUG',
        via: 'ÜBER',
        destination: 'NACH',
        delay: 'VERSPÄTUNG'
      },
      audioError: 'Der Sound konnte nicht abgespielt werden:'
    }
  }
} as const;

export type Translation = (typeof translations)[Language];
