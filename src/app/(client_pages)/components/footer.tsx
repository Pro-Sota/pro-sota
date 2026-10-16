
export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span>
          PRO SOTA - Arquitectura · Construção · Remodelação
        </span>

        <span>
          Lar do Patriota, Luanda - Angola
        </span>

        <span>
          © {new Date().getFullYear()} PRO SOTA.
          {" "}Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
