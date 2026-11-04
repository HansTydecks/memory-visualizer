/* Dateien im simulierten Datei-Explorer (Größen in Byte). */
(function () {
    const MV = (window.MV = window.MV || {});
    MV.FOLDERS = [
        { id: 'docs', name: 'Dokumente', icon: 'doc' },
        { id: 'pics', name: 'Bilder', icon: 'img' },
        { id: 'music', name: 'Musik', icon: 'music' },
        { id: 'videos', name: 'Videos', icon: 'video' },
    ];
    MV.FILES = [
        { id: 'brief', folder: 'docs', name: 'Brief.txt', type: 'text', kind: 'Textdokument (.txt)', app: 'Editor', bytes: 2148, date: '12.09.2026, 10:14' },
        { id: 'referat', folder: 'docs', name: 'Referat_Vulkane.docx', type: 'text', kind: 'Word-Dokument (.docx)', app: 'Textverarbeitung', bytes: 47261, date: '03.10.2026, 18:42' },
        { id: 'selfie', folder: 'pics', name: 'Selfie.jpg', type: 'image', kind: 'JPEG-Bild (.jpg)', app: 'Fotos', bytes: 3578880, date: '21.10.2026, 08:05' },
        { id: 'panorama', folder: 'pics', name: 'Panorama_Alpen.jpg', type: 'image', kind: 'JPEG-Bild (.jpg)', app: 'Fotos', bytes: 9123456, date: '14.08.2026, 15:31' },
        { id: 'lied', folder: 'music', name: 'Lied.mp3', type: 'music', kind: 'MP3-Audiodatei (.mp3)', app: 'Medienwiedergabe', bytes: 4311040, date: '02.06.2026, 19:20' },
        { id: 'hoerbuch', folder: 'music', name: 'Hoerbuch_Kapitel_1.mp3', type: 'music', kind: 'MP3-Audiodatei (.mp3)', app: 'Medienwiedergabe', bytes: 39845888, date: '30.07.2026, 21:02' },
        { id: 'trailer', folder: 'videos', name: 'Trailer.mp4', type: 'video', kind: 'MP4-Video (.mp4)', app: 'Filme & TV', bytes: 89128960, date: '11.10.2026, 16:47' },
        { id: 'film', folder: 'videos', name: 'Spielfilm.mp4', type: 'video', kind: 'MP4-Video (.mp4)', app: 'Filme & TV', bytes: 1505000000, date: '25.09.2026, 20:15' },
    ];
    MV.fileById = (id) => MV.FILES.find((f) => f.id === id);
})();
