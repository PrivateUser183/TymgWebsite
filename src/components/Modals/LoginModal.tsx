import { useState, FormEvent, useCallback, useRef, FC, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Divider,
  useDisclosure,
  Link,
  Form,
  ModalFooter,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  LogIn,
  TruckElectric,
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  Phone,
} from "lucide-react";
import { MyButton } from "../custom/MyButton";
import RegisterModal from "./RegisterModal";
import GoogleLoginBtn from "../Functional/GoogleLoginBtn";
import {
  checkEmailExists,
  checkPhoneExists,
  handleLoginUser,
} from "@/helpers/auth";
import { useDispatch } from "react-redux";
import {
  looksLikeEmail,
  looksLikeMobile,
  validateEmail,
  validateMobile,
  validatePassword,
} from "@/helpers/validator";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import { demoEmail, demoNumber, demoPassword } from "@/config/constants";

type ValidationErrors = {
  email?: string;
  mobile?: string;
  password?: string;
  [key: string]: string | undefined;
};
interface LoginModalProps {
  triggerView?: "btn" | "link" | "icon";
}
type LoginMode = "email" | "mobile";

export const LoginModal: FC<LoginModalProps> = ({ triggerView = "btn" }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);
  const { authSettings, demoMode } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [emailValue, setEmailValue] = useState(demoMode ? demoEmail : "");
  const [mobileValue, setMobileValue] = useState(demoMode ? demoNumber : "");
  const [passwordValue, setPasswordValue] = useState(
    demoMode ? demoPassword : ""
  );

  const [loginMode, setLoginMode] = useState<LoginMode>("mobile");
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const emailInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Debounce hook
  const useDebounce = <T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
  ) => {
    const timer = useRef<NodeJS.Timeout | null>(null);
    return useCallback(
      (...args: T) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => callback(...args), delay);
      },
      [callback, delay]
    );
  };

  // Debounced email existence check
  const debouncedEmailCheck = useDebounce(async (email: string) => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: undefined }));
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    try {
      setIsCheckingEmail(true);
      const exists = await checkEmailExists(
        email,
        setIsCheckingEmail,
        () => { }
      );
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          email: t("login_modal.errors.email_not_registered"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }, 1000);

  // Handle email input change
  const handleEmailChange = useCallback(
    (value: string) => {
      setEmailValue(value);
      setErrors((prev) => ({ ...prev, email: undefined }));

      if (value && looksLikeMobile(value) && !looksLikeEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address, not a mobile number",
        }));
        return;
      }

      debouncedEmailCheck(value);
    },
    [setEmailValue, setErrors, debouncedEmailCheck] // dependencies
  );

  const debouncedMobileCheck = useDebounce(async (mobile: string) => {
    if (!mobile.trim()) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
      return;
    }

    // Validation — must be 10 digits
    if (mobile.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit mobile number",
      }));
      return;
    }

    try {
      setIsCheckingMobile(true);
      const exists = await checkPhoneExists(
        mobile,
        setIsCheckingMobile,
        () => { }
      );
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          mobile: t("login_modal.errors.mobile_not_registered"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: undefined }));
      }
    } finally {
      setIsCheckingMobile(false);
    }
  }, 1000);

  // Handle mobile input change
  const handleMobileChange = useCallback(
    (value: string) => {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setMobileValue(digitsOnly);
      setErrors((prev) => ({ ...prev, mobile: undefined }));

      if (value && looksLikeEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          mobile: "Please enter a mobile number, not an email address",
        }));
        return;
      }

      debouncedMobileCheck(digitsOnly);
    },
    [setMobileValue, setErrors, debouncedMobileCheck]
  );

  // Handle tab change - clear errors and values for inactive tab
  const handleTabChange = (key: string | number) => {
    const newMode = key as LoginMode;
    setLoginMode(newMode);
    setErrors({});

    if (newMode === "email") {
      setMobileValue("");
      setIsMobileReadOnly(true); // Reset readonly for inactive tab
    } else {
      setEmailValue("");
      setIsEmailReadOnly(true); // Reset readonly for inactive tab
    }
  };

  // Handle form submission
  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = passwordValue;
    const validationErrors: ValidationErrors = {};

    if (loginMode === "email") {
      const email = formData.get("email") as string;

      if (looksLikeMobile(email) && !looksLikeEmail(email)) {
        validationErrors.email =
          "Please use the Mobile tab to login with a mobile number";
      } else {
        const emailError = validateEmail(email);
        if (emailError) validationErrors.email = emailError;
      }
    } else {
      const mobile = formData.get("mobile") as string;

      if (looksLikeEmail(mobile)) {
        validationErrors.mobile =
          "Please use the Email tab to login with an email address";
      } else {
        const mobileError = validateMobile(mobile);
        if (mobileError) validationErrors.mobile = mobileError;
      }
    }

    const passwordError = validatePassword(password);
    if (passwordError) validationErrors.password = passwordError;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const loginData = {
        email:
          loginMode === "email" ? (formData.get("email") as string) : undefined,
        mobile:
          loginMode === "mobile"
            ? (formData.get("mobile") as string)
            : undefined,
        password,
      };

      await handleLoginUser(loginData, dispatch);

      setErrors({});
      setEmailValue("");
      setMobileValue("");
      onOpenChange();
    } catch (error) {
      console.error("Login failed:", error);
      setErrors((prev) => ({
        ...prev,
        password: "Login failed. Please check your credentials.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleModalClose = () => {
    setErrors({});
    setEmailValue("");
    setMobileValue("");
    setPasswordValue("");
    setShowPassword(false);
    setLoginMode("email");
    setIsEmailReadOnly(true);
    setIsMobileReadOnly(true);

    // Force clear all inputs
    if (emailInputRef.current) emailInputRef.current.value = "";
    if (mobileInputRef.current) mobileInputRef.current.value = "";
  };

  useEffect(() => {
    if (isOpen && demoMode) {
      setMobileValue(demoNumber);
      setEmailValue(demoEmail);
      setPasswordValue(demoPassword);
    }
  }, [isOpen, loginMode, demoMode]);
  return (
    <>
      {/* Trigger Button */}
      {triggerView === "btn" ? (
        <MyButton
          id="login-btn"
          color="primary"
          onPress={onOpen}
          startContent={<LogIn size={16} />}
          size="responsive"
          variant="flat"
          className="p-0 text-xs"
        >
          {t("login_modal.button")}
        </MyButton>
      ) : triggerView === "icon" ? (
        <Button
          id="login-btn"
          size="sm"
          onPress={onOpen}
          isIconOnly
          className="p-0 rounded-full bg-transparent text-foreground/50 hover:text-foreground/70"
        >
          <User size={20} />
        </Button>
      ) : (
        <div
          className="text-primary-600 text-md underline cursor-pointer"
          onClick={onOpen}
          id="login-btn"
        >
          {t("login_modal.button")}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) handleModalClose();
          onOpenChange();
        }}
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        size="md"
        classNames={{
          base: "rounded-lg",
          header: "border-b border-divider",
          footer: "border-t border-divider",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <TruckElectric className="text-primary" size={24} />
                  <h2 className="font-semibold">
                    {t("login_modal.welcome_title")}
                  </h2>
                </div>
                <p className="text-sm text-default-500">
                  {t("login_modal.welcome_subtitle")}
                </p>
              </ModalHeader>

              <ModalBody className="py-6">
                <Form
                  ref={formRef}
                  className="w-full space-y-6"
                  onSubmit={handleLoginSubmit}
                  autoComplete="off"
                >
                  {/* Tabs */}
                  <div className="w-full flex justify-center">
                    <Tabs
                      selectedKey={loginMode}
                      onSelectionChange={handleTabChange}
                      classNames={{
                        tabList: "bg-default-100",
                        cursor: "hidden",
                        tab: "max-w-fit data-[selected=true]:!bg-primary data-[selected=true]:!rounded-small",
                        tabContent:
                          "text-default-900 group-data-[selected=true]:!text-white",
                      }}
                    >
                      <Tab
                        key="mobile"
                        title={
                          <div className="flex items-center gap-2">
                            <Smartphone size={16} />
                            <span>{t("login_modal.mobile_tab")}</span>
                          </div>
                        }
                      />
                      <Tab
                        key="email"
                        title={
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{t("login_modal.email_tab")}</span>
                          </div>
                        }
                      />
                    </Tabs>
                  </div>

                  {/* Input Fields */}
                  <div className="flex flex-col gap-6 w-full">
                    {loginMode === "email" ? (
                      <Input
                        ref={emailInputRef}
                        key="email-input" // Force remount on tab change
                        isRequired
                        autoComplete="email"
                        label={t("login_modal.email_label")}
                        labelPlacement="outside"
                        placeholder={t("login_modal.email_placeholder")}
                        name="email"
                        type="email"
                        value={emailValue}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        isReadOnly={isEmailReadOnly}
                        onFocus={() => setIsEmailReadOnly(false)}
                        classNames={{ errorMessage: "text-xs" }}
                        endContent={
                          isCheckingEmail ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          ) : (
                            <Mail size={18} className="text-default-400" />
                          )
                        }
                      />
                    ) : (
                      <Input
                        ref={mobileInputRef}
                        key="mobile-input" // Force remount on tab change
                        isRequired
                        autoComplete="tel"
                        label={t("login_modal.mobile_label")}
                        labelPlacement="outside"
                        placeholder={t("login_modal.mobile_placeholder")}
                        name="mobile"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9]*"
                        value={mobileValue}
                        onChange={(e) => handleMobileChange(e.target.value)}
                        isReadOnly={isMobileReadOnly}
                        onFocus={() => setIsMobileReadOnly(false)}
                        isInvalid={!!errors.mobile}
                        errorMessage={errors.mobile}
                        classNames={{ errorMessage: "text-xs" }}
                        maxLength={10}
                        endContent={
                          isCheckingMobile ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          ) : (
                            <Phone size={18} className="text-default-400" />
                          )
                        }
                      />
                    )}

                    <Input
                      key={`password-${loginMode}`}
                      isRequired
                      autoComplete="current-password"
                      label={t("login_modal.password_label")}
                      labelPlacement="outside"
                      placeholder={t("login_modal.password_placeholder")}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      errorMessage={errors.password}
                      classNames={{ errorMessage: "text-xs" }}
                      endContent={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-default-400" />
                          ) : (
                            <Eye size={18} className="text-default-400" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex justify-end w-full items-center">
                      <Link color="primary" href="/forgot-password" size="sm">
                        {t("login_modal.forgot_password")}
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    color="primary"
                    className="w-full font-medium"
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={isCheckingEmail || isCheckingMobile}
                  >
                    {t("login_modal.sign_in")}
                  </Button>
                </Form>

                {/* Social Login */}
                {authSettings?.googleLogin && (
                  <>
                    <div className="flex items-center gap-4 mt-6">
                      <Divider className="flex-1" />
                      <span className="text-default-500 text-sm">
                        {t("login_modal.or")}
                      </span>
                      <Divider className="flex-1" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <GoogleLoginBtn
                        isLoading={isLoading}
                        onOpenChange={onOpenChange}
                        setIsLoading={setIsLoading}
                        context="login"
                      />
                    </div>
                  </>
                )}
              </ModalBody>

              <ModalFooter className="flex items-center justify-center gap-2">
                <p className="text-center text-sm text-default-500">
                  {t("login_modal.no_account")}
                </p>
                <Link
                  color="primary"
                  size="sm"
                  onClick={() => {
                    document.getElementById("register-btn")?.click();
                    handleModalClose();
                    onClose();
                  }}
                  className="cursor-pointer"
                >
                  {t("login_modal.create_account")}
                </Link>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <RegisterModal />
    </>
  );
};

export default LoginModal;
