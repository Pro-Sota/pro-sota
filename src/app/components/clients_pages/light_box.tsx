/*
 * Galeria modal controlada pelo componente pai através de project e onClose.
 * Suporta teclado e gestos; bloqueia o scroll da página enquanto o projecto está aberto.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Lightbox({ project, onClose }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);

  useEffect(() => { setIndex(0); }, [project]);

  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [project]);

  if (!project) return null;
  const imgs = project.images || [];

  // Calcula o índice circular da galeria para ligar a última fotografia à primeira.
  function step(dir) {
    setIndex((i) => (i + dir + imgs.length) % imgs.length);
  }

  return (
    <div className="lightbox is-open">
      <div className="lightbox__backdrop" onClick={onClose} />
      <div className="lightbox__box" role="dialog" aria-modal="true">
        <button className="lightbox__close" aria-label="Fechar" onClick={onClose}>&times;</button>
        <div
          className="lightbox__stage"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1);
            touchX.current = null;
          }}
        >
          {imgs.length > 1 && (
            <button className="lightbox__nav lightbox__nav--prev" aria-label="Imagem anterior" onClick={() => step(-1)}>←</button>
          )}
          <img className="lightbox__img" src={imgs[index]} alt={project.name + ' — foto ' + (index + 1)} />
          {imgs.length > 1 && (
            <button className="lightbox__nav lightbox__nav--next" aria-label="Imagem seguinte" onClick={() => step(1)}>→</button>
          )}
        </div>
        <div className="lightbox__info">
          <div className="lightbox__head">
            <em className="lightbox__cat">{project.category} · {project.year}{project.location ? ' · ' + project.location : ''}</em>
            <span className="lightbox__count">{index + 1} / {imgs.length}</span>
          </div>
          <h3 className="lightbox__title">{project.name}</h3>
          <p className="lightbox__desc">{project.description || project.summary}</p>
          {imgs.length > 1 && (
            <div className="lightbox__thumbs">
              {imgs.map((src, i) => (
                <button key={i} className={'lightbox__thumb' + (i === index ? ' is-active' : '')} onClick={() => setIndex(i)}>
                  <Image src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

