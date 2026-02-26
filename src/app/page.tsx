import ChatClient from "@/components/chat/chat-client";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
      <ChatClient />
    </main>
  );
}
