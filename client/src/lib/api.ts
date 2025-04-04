export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Get the token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Prepare headers
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  
    if (!res.ok) {
      // Try to parse error as JSON first
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If it's not JSON, try to get the text
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE')) {
          errorMessage = text;
        }
      }
      throw new Error(`${res.status}: ${errorMessage}`);
    }
    
    // For HEAD requests or empty responses, don't try to parse JSON
    if (method === 'HEAD' || res.status === 204) {
      return null;
    }
    
    // Try to parse the response as JSON
    try {
      return await res.json();
    } catch (error) {
      // If the response is empty or not JSON, return null
      console.warn('Response is not valid JSON:', error);
      return null;
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
