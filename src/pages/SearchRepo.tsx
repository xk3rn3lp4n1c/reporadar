import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  AiSearchIcon,
  BookOpen02Icon,
  BotIcon,
  Cancel01Icon,
  GitForkIcon,
  LicenseIcon,
  StarIcon,
  ViewIcon,
} from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const SearchRepo = () => {
  const [url, setUrl] = useState("");
  const [repo, setRepo] = useState<any>(null);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [languages, setLanguages] = useState({});
  const [issues, setIssues] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [releases, setReleases] = useState([]);
  const [contributors, _setContributors] = useState([]);
  const [readme, setReadme] = useState("");
  const [license, setLicense] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<
    { role: string; text: string }[]
  >([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPullRequest, _setSelectedPullRequest] = useState<any>(null); // State for selected pull request
  const [pullRequestComments, _setPullRequestComments] = useState<any[]>([]); // State for pull request comments
  const [repoImageUrl, setRepoImageUrl] = useState<string | null>(null); // State for repo image

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const handleChat = async (message: string) => {
    if (!message.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setUserInput("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const result = await model.generateContent(
        `The repository "${repo}" is a project with the following details:
        - Description: ${repo.description}
        - Stars: ${repo.stargazers_count}
        - Watchers: ${repo.watchers_count}
        - Forks: ${repo.forks_count}
        - Size: ${repo.size} KB
        - Languages: ${Object.keys(languages).join(", ")}
        - Open Issues: ${repo.open_issues_count}
        - License: ${license?.license?.name || "No license"}

        Repository Owner:
        - Username: ${ownerInfo.login}
        - Bio: ${ownerInfo.bio || "No bio available"}
        - Profile URL: ${ownerInfo.html_url}
        
        Key Contributors:
        ${contributors
          .slice(0, 5)
          .map(
            (contributor: any) =>
              `- ${contributor.login}: ${contributor.contributions} contributions`
          )
          .join("\n")}
        
        Open Issues:
        ${issues
          .slice(0, 5)
          .map((issue: any) => `- ${issue.title} (${issue.state})`)
          .join("\n")}
        
        Open Pull Requests:
        ${pullRequests
          .slice(0, 5)
          .map((pr: any) => `- ${pr.title} (${pr.state})`)
          .join("\n")}
        
        Latest Releases:
        ${releases
          .slice(0, 5)
          .map((release: any) => `- ${release.tag_name}: ${release.name}`)
          .join("\n")}
        
        README Summary:
        ${readme.split("\n").slice(0, 10).join("\n")}...
        
        User Question: ${message}`
      );

      const response = await result.response;
      const aiResponse = response.text();

      setChatMessages((prev) => [...prev, { role: "ai", text: aiResponse }]);
    } catch (err) {
      console.error("Failed to generate AI response:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Failed to generate response. Please try again." },
      ]);
    }
  };

  const handleSearch = async () => {
    if (!url.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      setError("Invalid GitHub repository URL.");
      return;
    }

    const owner = match[1];
    const repoName = match[2];

    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!owner || !repoName) {
        throw new Error("Repository owner and name are required");
      }

      const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

      if (!GITHUB_TOKEN) {
        throw new Error("GitHub token is not configured");
      }

      const config = {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: "Bearer " + GITHUB_TOKEN,
        },
      };

      // Basic repository info
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}`,
        config
      );
      setRepo(repoResponse.data);

      // Only proceed if repository exists and we have access
      if (repoResponse.data) {
        // Parallel requests for better performance
        const [
          ownerResponse,
          languagesResponse,
          issuesResponse,
          pullRequestsResponse,
          releasesResponse,
          readmeResponse,
          licenseResponse,
        ] = await Promise.all([
          axios.get(`https://api.github.com/users/${owner}`, config),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/languages`,
            config
          ),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/issues`,
            config
          ),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/pulls`,
            config
          ),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/releases`,
            config
          ),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/readme`,
            {
              headers: {
                ...config.headers,
                Accept: "application/vnd.github.v3.raw",
              },
            }
          ),
          axios.get(
            `https://api.github.com/repos/${owner}/${repoName}/license`,
            config
          ),
        ]);

        // Set all the state values
        setOwnerInfo(ownerResponse.data);
        setLanguages(languagesResponse.data);
        setIssues(issuesResponse.data);
        setPullRequests(pullRequestsResponse.data);
        setReleases(releasesResponse.data);
        setReadme(readmeResponse.data);
        setLicense(licenseResponse.data);

        // Construct proper Open Graph image URL
        const imageUrl = `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
        setRepoImageUrl(imageUrl);

        // Set welcome message for public repositories
        if (!repoResponse.data.private) {
          setChatMessages([
            {
              role: "ai",
              text: `Hello! You can ask me anything about the repository "${repoResponse.data.full_name}".`,
            },
          ]);
        }
      }
    } catch (error: any) {
      // More specific error handling
      if (error.response) {
        switch (error.response.status) {
          case 404:
            setError(
              "Repository not found. Please check the owner and repository name."
            );
            break;
          case 401:
            setError("Authentication failed. Please check your GitHub token.");
            break;
          case 403:
            setError("API rate limit exceeded or insufficient permissions.");
            break;
          default:
            setError(
              `Failed to fetch repository details: ${error.response.data.message}`
            );
        }
      } else if (error.request) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
      console.error("GitHub API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the URL with the search query parameter
  const updateUrlWithSearchParam = (searchValue: string) => {
    const newUrl = new URL(window.location.href);
    if (searchValue) {
      newUrl.searchParams.set("search", searchValue);
    } else {
      newUrl.searchParams.delete("search");
    }
    window.history.replaceState({}, "", newUrl.toString());
  };

  // On component mount, check for the `search` query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");

    if (searchParam) {
      setUrl(searchParam);
      if (url) {
        handleSearch();
      }
    }
  }, []);

  // When the URL input changes, update the `search` query parameter
  useEffect(() => {
    updateUrlWithSearchParam(url);
  }, [url]);

  return (
    <div className="w-full relative py-6 md:py-10">
      <div className="sticky top-0 bg-background z-10 py-2">
        <div className="flex flex-row border border-zinc-100 p-1 rounded-full justify-start bg-background overflow-hidden">
          <input
            type="text"
            className="w-full p-2 px-4 outline-none"
            placeholder="Enter GitHub Repository URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className="text-sm flex justify-start items-center gap-2 text-primary-foreground p-2 px-4 bg-primary rounded-full"
            onClick={handleSearch}
            disabled={loading}
          >
            <AiSearchIcon className="w-4 h-4" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        {error && (
          <p className="text-red-500 mt-2 text-center text-sm p-4">{error}</p>
        )}

        {repo && (
          <div className="mt-6 space-y-6">
            <div className="">
              <h3 className="font-bold text-xl flex flex-row justify-start items-center gap-2 mb-2">
                {/* Repository Image */}
                {repoImageUrl && (
                  <img
                    src={repoImageUrl}
                    alt={`${repo.full_name} social preview`}
                    className="w-[2rem] h-[2rem] object-cover rounded-full"
                  />
                )}
                {repo.full_name}
                {repo.private ? (
                  <Badge className="text-xs rounded-full" variant={"default"}>
                    Private
                  </Badge>
                ) : (
                  <Badge className="text-xs rounded-full" variant={"default"}>
                    Public
                  </Badge>
                )}
              </h3>
              <div className="flex gap-2 flex-wrap text-sm">
                <p className="flex items-center gap-2 justify-start">
                  <StarIcon className="inline-block w-4 h-4" />{" "}
                  {repo.stargazers_count}
                </p>
                <p className="flex items-center gap-2 justify-start">
                  <ViewIcon className="inline-block w-4 h-4" />{" "}
                  {repo.watchers_count}
                </p>
                <p className="flex items-center gap-2 justify-start">
                  <GitForkIcon className="inline-block w-4 h-4" />{" "}
                  {repo.forks_count}
                </p>
                <p className="flex items-center gap-2 justify-start">
                  <LicenseIcon className="inline-block w-4 h-4" />{" "}
                  {license?.license.name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-start items-center gap-2">
              {Object.entries(languages).map(([language, bytes]: any) => {
                const totalBytes = (
                  Object.values(languages) as number[]
                ).reduce((acc, bytes) => acc + bytes, 0);
                const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                return (
                  <Badge
                    key={language}
                    className="text-xs rounded-full"
                    variant={"secondary"}
                  >
                    {language}
                    <span className="text-xs ml-2 text-gray-600">
                      {percentage}%
                    </span>
                  </Badge>
                );
              })}
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex justify-start flex-row items-center gap-4">
                    <BookOpen02Icon className="w-6 h-6" />
                    <span>README</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ReactMarkdown className="text-sm gap-4 md:p-8 flex flex-col p-2 bg-accent/10 rounded-lg">
                    {readme}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex justify-start flex-row items-center gap-4">
                    <BookOpen02Icon className="w-6 h-6" />
                    <span>Open Issues</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col justify-start gap-2">
                    {issues.map((issue: any) => (
                      <div
                        key={issue.id}
                        className="flex flex-col gap-2 hover:bg-gray-100 p-4"
                      >
                        <Link
                          to={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm group flex md:flex-col justify-between md:items-start gap-2 flex-col"
                        >
                          <div className="flex flex-row justify-start items-center gap-2">
                            <span>{issue.title}</span>
                          </div>
                          <span className="text-xs">
                            {format(new Date(issue.updated_at), "dd MMM yyyy")}
                          </span>
                          <div className="flex flex-wrap justify-start items-center gap-2">
                            {issue.labels.map((label: any) => (
                              <Badge
                                key={label.id}
                                className="text-nowrap inline-block text-xs text-foreground rounded-full capitalize"
                                style={{ backgroundColor: `#${label.color}55` }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        </Link>
                        <div>
                          {issue.reactions && issue.reactions.laugh > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.laugh} 😂
                            </span>
                          )}
                          {issue.reactions && issue.reactions.hooray > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.hooray} 🎉
                            </span>
                          )}
                          {issue.reactions && issue.reactions.confused > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.confused} 😕
                            </span>
                          )}
                          {issue.reactions && issue.reactions.heart > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.heart} ❤
                            </span>
                          )}
                          {issue.reactions && issue.reactions.rocket > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.rocket} 🚀
                            </span>
                          )}
                          {issue.reactions && issue.reactions.eyes > 0 && (
                            <span className="text-sm text-primary">
                              {issue.reactions.eyes} 👀
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Open Pull Requests Section */}
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex justify-start flex-row items-center gap-4">
                    <BookOpen02Icon className="w-6 h-6" />
                    <span>Open Pull Requests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col justify-start gap-2">
                    {pullRequests.map((pr: any) => (
                      <div
                        key={pr.id}
                        className="flex flex-col gap-2 hover:bg-gray-100 p-4"
                      >
                        <Link
                          to={pr.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm group flex md:flex-col justify-between md:items-start gap-2 flex-col"
                        >
                          <div className="flex flex-row justify-start items-center gap-2">
                            <span>{pr.title}</span>
                          </div>
                          <span className="text-xs">
                            {format(new Date(pr.updated_at), "dd MMM yyyy")}
                          </span>
                          <div className="flex flex-wrap justify-start items-center gap-2">
                            {pr.labels.map((label: any) => (
                              <Badge
                                key={label.id}
                                className="text-nowrap inline-block text-xs text-foreground rounded-full capitalize"
                                style={{ backgroundColor: `#${label.color}55` }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        </Link>
                        <div>
                          {pr.reactions && pr.reactions.laugh > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.laugh} 😂
                            </span>
                          )}
                          {pr.reactions && pr.reactions.hooray > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.hooray} 🎉
                            </span>
                          )}
                          {pr.reactions && pr.reactions.confused > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.confused} 😕
                            </span>
                          )}
                          {pr.reactions && pr.reactions.heart > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.heart} ❤
                            </span>
                          )}
                          {pr.reactions && pr.reactions.rocket > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.rocket} 🚀
                            </span>
                          )}
                          {pr.reactions && pr.reactions.eyes > 0 && (
                            <span className="text-sm text-primary">
                              {pr.reactions.eyes} 👀
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {selectedPullRequest && (
              <div className="border p-4">
                <h3 className="font-bold text-xl">Pull Request Details</h3>
                <div className="mt-4">
                  <h4 className="font-bold">{selectedPullRequest.title}</h4>
                  <p>{selectedPullRequest.body}</p>
                  <div className="mt-4">
                    <h4 className="font-bold">Comments</h4>
                    <ul>
                      {pullRequestComments.map((comment) => (
                        <li key={comment.id} className="mt-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.login}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-bold">{comment.user.login}</p>
                              <ReactMarkdown>{comment.body}</ReactMarkdown>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {repo && (
          <div className="space-y-6">
            <div className="p-4">
              <h3 className="text-base mb-2">Releases ({releases.length})</h3>
              <ul className="space-y-1">
                {releases.map((release: any) => (
                  <li key={release.id}>
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary hover:underline text-sm"
                    >
                      {release.tag_name} - {release.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Chat Toggle Button */}
      <button
        className={`fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors ${
          repo ? "block" : "hidden"
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <BotIcon className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed inset-0 bottom-0 w-full h-full md:bottom-20 md:right-6 md:h-full md:w-96 bg-white md:border border-gray-200 md:rounded-lg shadow-lg flex flex-col z-50 md:max-h-[50%] overflow-hidden md:r md:inset-auto">
          <div className="p-4 bg-primary text-white flex flex-row justify-between items-center">
            <h3 className="text-base">Chat with Reporadar</h3>
            <button type="button" onClick={() => setIsChatOpen(!isChatOpen)}>
              <Cancel01Icon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <ReactMarkdown
                  className={`text-sm w-full whitespace-normal break-words ${
                    message.role === "user"
                      ? "bg-primary text-white ml-auto w-fit"
                      : "bg-gray-200 text-black"
                  } p-4 rounded-lg`} // Added padding and rounded corners
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ))}
          </div>
          <input
            type="text"
            className="w-full p-4 text-sm border-t outline-none"
            placeholder="Ask me anything about the repository..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat(userInput)}
          />
        </div>
      )}
    </div>
  );
};

export default SearchRepo;
