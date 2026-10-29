513
514
515
516
517
518
519
520
521
522
523
524
525
526
527
528
529
530
531
532
533
534
535
536
537
538
539
540
541
542
543
544
545
546
547
548
549
550
551
552
553
554
555
556
557
558
559
560
561
562
563
564
565
566
567
568
569
570
571
572
573
574
575
576
577
578
579
580
581
582
583
584
585
586
587
588
589
590
591
592
593
594
595
596
597
598
599
600
601
602
603
604
605
606
607
608
609
610
611
612
613
614
615
616
617
618
619
620
621
622
623
    </>
  );
}

/*
 * ============================================================
 * MOBILE NAVIGATION ITEM
 * ============================================================
 */

function MobileNavItem({
  item,
  active,
  onClick,
  logoutLoading = false,
}: NavItemProps) {
  const Icon = item.icon;

  const label =
    item.action === "logout" && logoutLoading ? "A sair..." : item.name;

  const itemClasses = [
    "group relative flex w-full min-w-0",
    "h-10 items-center gap-3 rounded-md",
    "px-3",
    "text-sm font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#002950]",
    "focus-visible:ring-offset-2",
  ].join(" ");

  /* LOGOUT BUTTON */
  if (item.action === "logout") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={logoutLoading}
        aria-label={label}
        className={[
          itemClasses,
          "text-gray-600",
          "hover:bg-gray-100",
          "hover:text-[#BD9655]",
          "disabled:cursor-not-allowed",
          "disabled:opacity-60",
        ].join(" ")}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {logoutLoading ? (
            <Loader2
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 animate-spin"
              strokeWidth={1.8}
            />
          ) : (
            <Icon
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0"
              strokeWidth={1.8}
            />
          )}
        </span>

        <span className="min-w-0 overflow-hidden whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  }

  /* NORMAL NAVIGATION LINK */
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={[
        itemClasses,
        active
          ? [
              "border-l-[3px]",
              "border-[#BD9655]",
              "bg-[#BD9655]",
              "text-[#002950]",
              "pl-[9px]",
            ].join(" ")
          : [
              "text-gray-600",
              "hover:bg-gray-100",
              "hover:text-[#BD9655]",
            ].join(" "),
      ].join(" ")}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon
          aria-hidden="true"
          className="h-[18px] w-[18px] shrink-0"
          strokeWidth={1.8}
        />
      </span>

      <span className="min-w-0 overflow-hidden whitespace-nowrap">
        {item.name}
      </span>
    </Link>
  );
}