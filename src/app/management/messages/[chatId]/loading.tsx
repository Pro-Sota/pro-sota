export default function ChatLoading() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 animate-pulse">
      {/* Chat */}
      <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />

            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-9 w-9 rounded-lg bg-slate-100" />
        </header>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
          <div className="flex h-full flex-col justify-end gap-4">
            {/* Received */}
            <div className="flex max-w-[70%] items-end gap-2">
              <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />

              <div className="space-y-2">
                <div className="h-10 w-56 rounded-2xl rounded-bl-md bg-slate-100" />
                <div className="h-2.5 w-12 rounded bg-slate-100" />
              </div>
            </div>

            {/* Sent */}
            <div className="ml-auto max-w-[70%] space-y-2">
              <div className="h-10 w-64 rounded-2xl rounded-br-md bg-slate-200" />
              <div className="ml-auto h-2.5 w-12 rounded bg-slate-100" />
            </div>

            {/* Received */}
            <div className="flex max-w-[70%] items-end gap-2">
              <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />

              <div className="space-y-2">
                <div className="h-12 w-72 rounded-2xl rounded-bl-md bg-slate-100" />
                <div className="h-2.5 w-12 rounded bg-slate-100" />
              </div>
            </div>

            {/* Sent */}
            <div className="ml-auto max-w-[70%] space-y-2">
              <div className="h-10 w-48 rounded-2xl rounded-br-md bg-slate-200" />
              <div className="ml-auto h-2.5 w-12 rounded bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 flex-1 rounded-xl bg-slate-100" />
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
          </div>
        </div>
      </section>

      {/* Project sidebar */}
      <aside className="hidden h-full w-[320px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white xl:flex">
        <div className="flex h-[73px] shrink-0 items-center justify-center border-b border-slate-200">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>

        <div className="space-y-4 p-6">
          <div className="h-24 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-32 rounded-xl bg-slate-100" />
        </div>
      </aside>
    </div>
  );
}