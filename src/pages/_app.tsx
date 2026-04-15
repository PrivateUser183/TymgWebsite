import type { AppProps } from "next/app";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import ReduxProvider from "@/lib/redux/ReduxProvider";
import DefaultLayout from "@/layouts/default";
import { NextPageWithLayout } from "@/types";
import { fontSans, fontMono } from "@/config/fonts";
import { trackPageView } from "@/lib/analytics";
import "@/styles/index.css";
import { CircleX } from "lucide-react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error boundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ToastProvider = dynamic(
  () => import("@heroui/react").then((mod) => mod.ToastProvider),
  { ssr: false }
);

const ProgressBar = dynamic(() => import("@/components/ProgressBar"), {
  ssr: false,
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Get the page title from document or use the URL as fallback
      const pageTitle = document.title || url;
      trackPageView(url, pageTitle);
    };

    // Track initial page view
    handleRouteChange(router.pathname);

    // Listen to route changes
    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup listener on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, router.pathname]);

  // ✅ Use custom layout if defined, else wrap in DefaultLayout
  const getLayout =
    Component.getLayout ??
    ((page) => (
      <DefaultLayout initialSettings={pageProps?.initialSettings}>
        {page}
      </DefaultLayout>
    ));

  return (
    <ErrorBoundary>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider
          defaultTheme="system"
          attribute="class"
          disableTransitionOnChange
        >
          <ProgressBar />
          <ToastProvider
            placement="top-right"
            toastOffset={10}
            toastProps={{
              classNames: {
                base: "pr-6",
              },
              timeout: 4000,
              closeIcon: (
                <CircleX
                  size={34}
                  strokeWidth={2.5}
                  className="text-foreground/25"
                />
              ),
            }}
          />
          <ReduxProvider>{getLayout(<Component {...pageProps} />)}</ReduxProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ErrorBoundary>
  );
}

export default App;

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
