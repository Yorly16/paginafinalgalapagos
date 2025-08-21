interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

class GitHubDataService {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = {
      ...config,
      branch: config.branch || 'main'
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async readFile(path: string): Promise<any> {
    try {
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
      const response: GitHubFileResponse = await this.makeRequest(endpoint);
      
      if (response.encoding === 'base64') {
        const content = atob(response.content);
        return JSON.parse(content);
      }
      
      throw new Error('Unsupported encoding');
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      throw error;
    }
  }

  async writeFile(path: string, data: any, message: string): Promise<void> {
    try {
      // First, try to get the current file to get its SHA
      let sha: string | undefined;
      try {
        const currentFile = await this.makeRequest(
          `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`
        );
        sha = currentFile.sha;
      } catch (error) {
        // File doesn't exist, that's okay
      }

      const content = btoa(JSON.stringify(data, null, 2));
      const endpoint = `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
      
      const body: any = {
        message,
        content,
        branch: this.config.branch,
      };

      if (sha) {
        body.sha = sha;
      }

      await this.makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error(`Error writing file ${path}:`, error);
      throw error;
    }
  }

  // Métodos específicos para cada tipo de datos
  async getUsers(): Promise<any[]> {
    return this.readFile('data/users.json');
  }

  async updateUsers(users: any[], message = 'Update users data'): Promise<void> {
    return this.writeFile('data/users.json', users, message);
  }

  async getSpecies(): Promise<any[]> {
    return this.readFile('data/species.json');
  }

  async updateSpecies(species: any[], message = 'Update species data'): Promise<void> {
    return this.writeFile('data/species.json', species, message);
  }

  async getResearchers(): Promise<any[]> {
    return this.readFile('data/researchers.json');
  }

  async updateResearchers(researchers: any[], message = 'Update researchers data'): Promise<void> {
    return this.writeFile('data/researchers.json', researchers, message);
  }

  async getPermissions(): Promise<any[]> {
    return this.readFile('data/permissions.json');
  }

  async updatePermissions(permissions: any[], message = 'Update permissions data'): Promise<void> {
    return this.writeFile('data/permissions.json', permissions, message);
  }

  // Método para agregar un nuevo elemento a cualquier archivo
  async addItem(dataType: 'users' | 'species' | 'researchers' | 'permissions', item: any): Promise<void> {
    const currentData = await this.readFile(`data/${dataType}.json`);
    const updatedData = [...currentData, { ...item, id: Date.now().toString() }];
    await this.writeFile(`data/${dataType}.json`, updatedData, `Add new ${dataType.slice(0, -1)}`);
  }

  // Método para actualizar un elemento existente
  async updateItem(dataType: 'users' | 'species' | 'researchers' | 'permissions', id: string, updates: any): Promise<void> {
    const currentData = await this.readFile(`data/${dataType}.json`);
    const updatedData = currentData.map((item: any) => 
      item.id === id ? { ...item, ...updates } : item
    );
    await this.writeFile(`data/${dataType}.json`, updatedData, `Update ${dataType.slice(0, -1)} ${id}`);
  }

  // Método para eliminar un elemento
  async deleteItem(dataType: 'users' | 'species' | 'researchers' | 'permissions', id: string): Promise<void> {
    const currentData = await this.readFile(`data/${dataType}.json`);
    const updatedData = currentData.filter((item: any) => item.id !== id);
    await this.writeFile(`data/${dataType}.json`, updatedData, `Delete ${dataType.slice(0, -1)} ${id}`);
  }
}

// Instancia singleton del servicio
let githubService: GitHubDataService | null = null;

export const getGitHubService = (): GitHubDataService => {
  if (!githubService) {
    const config = {
      token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
      owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
      repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
    };

    if (!config.token || !config.owner || !config.repo) {
      throw new Error('GitHub configuration is missing. Please set NEXT_PUBLIC_GITHUB_TOKEN, NEXT_PUBLIC_GITHUB_OWNER, and NEXT_PUBLIC_GITHUB_REPO environment variables.');
    }

    githubService = new GitHubDataService(config);
  }

  return githubService;
};

export default GitHubDataService;