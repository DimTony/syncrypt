import React, { useEffect, useState } from "react";
import MobileWarning from "../components/ui/MobileWarning";
import {
  Box,
  Text,
  VStack,
  HStack,
  useBreakpointValue,
  Center,
  Select,
  createListCollection,
  Portal,
  Field,
  Input,
  defineStyle,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { LuCopy } from "react-icons/lu";

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  connection?: { isp: string };
}

interface EncryptionResponse {
  encrypted: boolean;
  encryptionStatus?: "pending" | "rejected" | "verified";
}

const floatingStyles = defineStyle({
  pos: "absolute",
  bg: "bg",
  px: "0.5",
  top: "-3",
  insetStart: "2",
  fontWeight: "normal",
  pointerEvents: "none",
  transition: "position",
  _peerPlaceholderShown: {
    color: "fg.muted",
    top: "2.5",
    insetStart: "3",
  },
  _peerFocusVisible: {
    color: "fg",
    top: "-3",
    insetStart: "2",
  },
});

const Landing: React.FC = () => {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appReady, setAppReady] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [encryptionStatus, setEncryptionStatus] = useState<
    "pending" | "rejected" | "verified"
  >("pending");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [method, setMethod] = useState<string[]>([]);
  const [cipherKey, setCipherKey] = useState<string>("");
  const [contentVisible, setContentVisible] = useState<boolean>(false);

  // New state variables for encryption functionality
  const [textToEncrypt, setTextToEncrypt] = useState<string>("");
  const [encryptedText, setEncryptedText] = useState<string>("");
  const [textToDecrypt, setTextToDecrypt] = useState<string>("");
  const [decryptedText, setDecryptedText] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const navigate = useNavigate();

  // Determine if the device is mobile or desktop
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isDesktop = useBreakpointValue({ base: false, md: true });

  useEffect(() => {
    if (method.length > 0) {
      // First fade out current content
      setContentVisible(false);

      // Then after animation completes, fade in new content
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 300); // Match this with your CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [method]);

  useEffect(() => {
    if (!isMobile) return; // Only fetch data if on mobile
    const fetchIpInfo = async () => {
      try {
        const ipResponse = await axios.get<{ ip: string }>(
          "https://api.ipify.org?format=json"
        );
        const ipData = ipResponse.data;
        setIpInfo(ipData);

        if (ipData.ip) {
          try {
            const geoResponse = await axios.get<IpInfo>(
              `https://ipwho.is/${ipData.ip}`
            );
            const geoData = geoResponse.data;
            if (geoData && geoData.ip)
              setIpInfo((prevState) => ({ ...prevState, ...geoData }));
          } catch (geoError) {
            console.warn("Error fetching location data:", geoError);
          }

          try {
            const encryptionResponse = await axios.post<EncryptionResponse>(
              `${import.meta.env.VITE_API_URL}/api/check-encryption`,
              { ip: ipData.ip }
            );
            setIsEncrypted(encryptionResponse.data.encrypted);
            if (encryptionResponse.data.encryptionStatus) {
              setEncryptionStatus(encryptionResponse.data.encryptionStatus);
            }
          } catch (encryptionError) {
            console.error("Error checking encryption status:", encryptionError);
            setIsEncrypted(false);
            toaster.create({
              title: "Encryption Check Failed",
              description: "Could not verify if your connection is encrypted",
              type: "warning",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching IP information:", err);
        toaster.create({
          title: "Error fetching data",
          description: (err as Error).message,
          type: "error",
        });
      } finally {
        setLoading(false);
        setAppReady(true);
      }
    };

    fetchIpInfo();
  }, [isMobile]);

  // Encryption function using a simple Caesar cipher
  const encryptText = (text: string, key: string): string => {
    if (!text || !key) return "";

    // Generate a numeric key from the string key
    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i);
    }
    // Use modulo to keep the shift within a reasonable range
    numericKey = numericKey % 26;

    let result = "";

    for (let i = 0; i < text.length; i++) {
      let char = text[i];

      // Only encrypt letters, leave other characters as is
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);

        // Uppercase letters
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 + numericKey) % 26) + 65);
        }
        // Lowercase letters
        else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 + numericKey) % 26) + 97);
        }
      }

      result += char;
    }

    return result;
  };

  // Decryption function (reverse of the Caesar cipher)
  const decryptText = (text: string, key: string): string => {
    if (!text || !key) return "";

    // Generate the same numeric key as for encryption
    let numericKey = 0;
    for (let i = 0; i < key.length; i++) {
      numericKey += key.charCodeAt(i);
    }
    numericKey = numericKey % 26;

    let result = "";

    for (let i = 0; i < text.length; i++) {
      let char = text[i];

      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);

        // Uppercase letters
        if (code >= 65 && code <= 90) {
          // Add 26 to ensure positive value after modulo
          char = String.fromCharCode(((code - 65 - numericKey + 26) % 26) + 65);
        }
        // Lowercase letters
        else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 - numericKey + 26) % 26) + 97);
        }
      }

      result += char;
    }

    return result;
  };

  // Handle encryption
  const handleEncrypt = () => {
    if (!textToEncrypt) {
      toaster.create({
        title: "Error",
        description: "Please enter text to encrypt",
        type: "error",
      });
      return;
    }

    if (!cipherKey) {
      toaster.create({
        title: "Error",
        description: "Please enter a cipher key",
        type: "error",
      });
      return;
    }

    const encrypted = encryptText(textToEncrypt, cipherKey);
    setEncryptedText(encrypted);
  };

  // Handle decryption
  const handleDecrypt = () => {
    if (!textToDecrypt) {
      toaster.create({
        title: "Error",
        description: "Please enter text to decrypt",
        type: "error",
      });
      return;
    }

    if (!cipherKey) {
      toaster.create({
        title: "Error",
        description: "Please enter a cipher key",
        type: "error",
      });
      return;
    }

    const decrypted = decryptText(textToDecrypt, cipherKey);
    setDecryptedText(decrypted);
  };

  // Clear function for encrypt panel
  const handleClearEncrypt = () => {
    setTextToEncrypt("");
    setEncryptedText("");
  };

  // Clear function for decrypt panel
  const handleClearDecrypt = () => {
    setTextToDecrypt("");
    setDecryptedText("");
  };

  // Copy function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        toaster.create({
          title: "Copied!",
          description: "Text copied to clipboard",
          type: "success",
        });

        // Reset copy status after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toaster.create({
          title: "Error",
          description: "Failed to copy text",
          type: "error",
        });
      }
    );
  };

  const frameworks = createListCollection({
    items: [
      { label: "Encrypt", value: "encrypt" },
      { label: "Decrypt", value: "decrypt" },
    ],
  });

  // **Hide Landing on Desktop**
  if (!isMobile) return isDesktop ? <MobileWarning /> : null;

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <Center w="100dvw" h="100dvh">
        <LoadingSpinner />
      </Center>
    );
  }

  return (
    <>
      {appReady && (
        <>
          <VStack
            className="app"
            alignItems="flex-start"
            w="100dvw"
            h="100dvh"
            padding={4}
            overflowY="auto"
          >
            <HStack w="100%">
              <a href="/">
                <img src="/logoFull.svg" alt="logo" style={{ width: "5rem" }} />
              </a>
            </HStack>
            <VStack alignItems="flex-start" w="100%">
              <HStack>
                <Text>Device Status:</Text>
                <HStack>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px 10px",
                      borderRadius: "9999px",
                      backgroundColor: isEncrypted ? "#C6F6D5" : "#FED7D7",
                      color: isEncrypted ? "#22543D" : "#822727",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isEncrypted ? "#38A169" : "#E53E3E",
                        marginRight: "6px",
                      }}
                    />
                    {isEncrypted ? "Encrypted" : "Unencrypted"}
                  </div>
                </HStack>
              </HStack>
              {ipInfo && (
                <Box
                  mt={4}
                  p={3}
                  bg="blackAlpha.700"
                  color="white"
                  borderRadius="md"
                  w="100%"
                >
                  <Text fontSize="sm">IP: {ipInfo.ip}</Text>
                  {ipInfo.city && (
                    <>
                      <Text fontSize="sm">
                        Location: {ipInfo.city}, {ipInfo.region},{" "}
                        {ipInfo.country_name}
                      </Text>
                      {ipInfo.connection && (
                        <Text fontSize="sm">ISP: {ipInfo.connection.isp}</Text>
                      )}
                    </>
                  )}
                </Box>
              )}
              {!isEncrypted && (
                <VStack w="100%" alignItems="flex-start" mt={4}>
                  <hr
                    style={{
                      width: "100%",
                      borderTop: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                  {encryptionStatus === "pending" && (
                    <div
                      style={{
                        backgroundColor: "#FFFBEA",
                        padding: "16px",
                        borderRadius: "6px",
                        width: "100%",
                      }}
                    >
                      <Text fontWeight="bold" color="#B7791F">
                        Pending Verification
                      </Text>
                      <Text fontSize="sm" color="#4A5568">
                        Your encryption request is being reviewed.
                      </Text>
                    </div>
                  )}

                  <Link
                    style={{ width: "100%" }}
                    to="https://device-encryption.vercel.app/"
                  >
                    <button
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor: showForm ? "transparent" : "#3182CE",
                        color: showForm ? "#3182CE" : "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Go To Encryptor
                    </button>
                  </Link>
                </VStack>
              )}

              {isEncrypted && (
                <>
                  <Box width="100%" mt={4}>
                    <Field.Root required>
                      <Field.Label>
                        Cipher Key: <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        placeholder="Enter cipher here"
                        variant="subtle"
                        size="md"
                        value={cipherKey}
                        onChange={(e) => setCipherKey(e.target.value)}
                      />
                    </Field.Root>
                  </Box>
                  <Box width="100%" mt={2}>
                    <Select.Root
                      variant="subtle"
                      size="md"
                      collection={frameworks}
                      value={method}
                      onValueChange={(e) => setMethod(e.value)}
                      style={{ width: "100%" }}
                    >
                      <Select.HiddenSelect />
                      <Select.Label>Type:</Select.Label>
                      <Select.Control style={{ width: "100%" }}>
                        <Select.Trigger
                          style={{ minWidth: "120px", width: "100%" }}
                        >
                          <Select.ValueText
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "visible",
                            }}
                            placeholder="Select framework"
                          />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content style={{ minWidth: "120px" }}>
                            {frameworks.items.map((framework) => (
                              <Select.Item
                                item={framework}
                                key={framework.value}
                              >
                                {framework.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Box>
                </>
              )}

              {cipherKey.trim() && (
                <Box
                  w="100%"
                  mt={3}
                  style={{
                    opacity: contentVisible ? 1 : 0,
                    transition: "opacity 300ms ease-in-out",
                    height: method.length > 0 ? "auto" : "0",
                    overflow: "hidden",
                  }}
                >
                  {method.includes("encrypt") && (
                    <Box
                      p={4}
                      bg="white"
                      borderRadius="md"
                      w="100%"
                      boxShadow="sm"
                      h='100%'
                    >
                      <Text fontWeight="bold" mb="1rem">
                        Encryption Panel
                      </Text>

                      <Field.Root>
                        <Box pos="relative" w="full">
                          <Textarea
                            height="10rem"
                            className="peer"
                            placeholder=""
                            value={textToEncrypt}
                            onChange={(e) => setTextToEncrypt(e.target.value)}
                          />
                          <Field.Label css={floatingStyles}>
                            Enter text to encrypt
                          </Field.Label>
                        </Box>
                      </Field.Root>

                      <HStack
                        my="1rem"
                        width="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Button
                          bgGradient="to-r"
                          gradientFrom="#2FB8E4"
                          gradientTo="#1B71FF"
                          variant="solid"
                          onClick={handleEncrypt}
                        >
                          Encrypt
                        </Button>
                        <Button
                          outline="#1B71FF"
                          variant="outline"
                          onClick={handleClearEncrypt}
                        >
                          Clear
                        </Button>
                      </HStack>

                      <VStack>
                        <HStack w="100%" justifyContent="space-between">
                          <Text>Encrypted Text:</Text>
                          <Box
                            as="button"
                            onClick={() =>
                              encryptedText && handleCopy(encryptedText)
                            }
                            opacity={encryptedText ? 1 : 0.5}
                            cursor={encryptedText ? "pointer" : "not-allowed"}
                          >
                            <LuCopy color={isCopied ? "#38A169" : undefined} />
                          </Box>
                        </HStack>

                        <Textarea
                          minH="10rem"
                          value={encryptedText}
                          readOnly
                        />
                      </VStack>
                    </Box>
                  )}

                  {method.includes("decrypt") && (
                    <Box
                      p={4}
                      bg="white"
                      borderRadius="md"
                      w="100%"
                      boxShadow="sm"
                    >
                      <Text fontWeight="bold" mb="1rem">
                        Decryption Panel
                      </Text>

                      <Field.Root>
                        <Box pos="relative" w="full">
                          <Textarea
                            height="10rem"
                            className="peer"
                            placeholder=""
                            value={textToDecrypt}
                            onChange={(e) => setTextToDecrypt(e.target.value)}
                          />
                          <Field.Label css={floatingStyles}>
                            Enter text to decrypt
                          </Field.Label>
                        </Box>
                      </Field.Root>

                      <HStack
                        my="1rem"
                        width="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Button
                          bgGradient="to-r"
                          gradientFrom="#2FB8E4"
                          gradientTo="#1B71FF"
                          variant="solid"
                          onClick={handleDecrypt}
                        >
                          Decrypt
                        </Button>
                        <Button
                          outline="#1B71FF"
                          variant="outline"
                          onClick={handleClearDecrypt}
                        >
                          Clear
                        </Button>
                      </HStack>

                      <VStack>
                        <HStack w="100%" justifyContent="space-between">
                          <Text>Decrypted Text:</Text>
                          <Box
                            as="button"
                            onClick={() =>
                              decryptedText && handleCopy(decryptedText)
                            }
                            opacity={decryptedText ? 1 : 0.5}
                            cursor={decryptedText ? "pointer" : "not-allowed"}
                          >
                            <LuCopy color={isCopied ? "#38A169" : undefined} />
                          </Box>
                        </HStack>

                        <Textarea
                          minH="10rem"
                          value={decryptedText}
                          readOnly
                        />
                      </VStack>
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          </VStack>
        </>
      )}
    </>
  );
};

export default Landing;
