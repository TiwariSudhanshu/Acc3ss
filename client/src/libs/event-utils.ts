const convertIPFSToHTTP = (ipfsUri: string): string => {
  if (ipfsUri?.startsWith("ipfs://")) {
    return ipfsUri.replace(
      "ipfs://",
      "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/"
    );
  }
  return ipfsUri || "/placeholder.svg";
};

const fetchIPFSMetadata = async (baseURI: string) => {
  try {
    const httpUrl = convertIPFSToHTTP(baseURI);
    const response = await fetch(httpUrl);
    if (!response.ok) throw new Error("IPFS fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching IPFS metadata:", error);
    return null;
  }
};

const formatDateTime = (isoString: string): { date: string; time: string } => {
  try {
    const date = new Date(isoString);

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return {
      date: dateStr,
      time: timeStr,
    };
  } catch {
    return {
      date: "TBD",
      time: "TBD",
    };
  }
};


export { convertIPFSToHTTP, fetchIPFSMetadata, formatDateTime };